import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, MessageSquarePlus, Clock, ChevronDown } from 'lucide-react';
import { useDashboardHeader } from './NewDashboardContainer'; // assuming it's imported here if placed in common/ or new-dashboard/

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

const STARTER_PROMPTS = [
  "How do I create a job posting?",
  "How do I move candidates in the hiring pipeline?",
  "How do I restrict a candidate?",
  "How do I create a recruiter account?",
  "How do approvals work?"
];

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

const AIMentor: React.FC = () => {
  const { setHeaderActions } = useDashboardHeader();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('fluidjobs_ai_mentor_chats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Correct dates
        const corrected = parsed.map((s: any) => ({
          ...s,
          updatedAt: new Date(s.updatedAt),
          messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
        setSessions(corrected);
        if (corrected.length > 0) {
          setActiveSessionId(corrected[0].id);
        }
      } catch (e) {
        console.error("Failed to parse chats", e);
      }
    }
  }, []);

  // Set Header actions
  useEffect(() => {
    setHeaderActions(
      <div className="flex bg-white items-center gap-3">
        <button
          onClick={startNewChat}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <MessageSquarePlus className="w-4 h-4" />
          New Chat
        </button>
      </div>
    );
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  // Save to local storage when sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('fluidjobs_ai_mentor_chats', JSON.stringify(sessions));
    } else {
      localStorage.removeItem('fluidjobs_ai_mentor_chats');
    }
  }, [sessions]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, isTyping]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const currentMessages = activeSession?.messages || [];

  const startNewChat = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      updatedAt: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  const updateSessionMessages = (sessionId: string, newMessages: Message[], title?: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          messages: newMessages,
          title: title || session.title,
          updatedAt: new Date()
        };
      }
      return session;
    }).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    let targetSessionId = activeSessionId;
    let targetMessages = currentMessages;

    // Create session if none exists
    if (!targetSessionId) {
      targetSessionId = generateId();
      const newSession: ChatSession = {
        id: targetSessionId,
        title: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
        messages: [],
        updatedAt: new Date()
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(targetSessionId);
      targetMessages = [];
    }

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    // Add User Message
    const updatedMessages = [...targetMessages, userMsg];
    updateSessionMessages(targetSessionId, updatedMessages, targetMessages.length === 0 ? text.substring(0, 30) : undefined);

    setInputMessage('');
    setIsTyping(true);

    try {
      const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('superadmin_token') || localStorage.getItem('token');

      const payloadMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: payloadMessages })
      });
      const data = await response.json();

      if (data.success && data.reply) {
        const aiMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date()
        };
        updateSessionMessages(targetSessionId, [...updatedMessages, aiMsg]);
      } else {
        const errorMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date()
        };
        updateSessionMessages(targetSessionId, [...updatedMessages, errorMsg]);
      }
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Network error. Please try again later.',
        timestamp: new Date()
      };
      updateSessionMessages(targetSessionId, [...updatedMessages, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">

      {/* Sidebar for History */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span className="text-sm font-medium">New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2 mt-2">Recent Chats</h3>

          {sessions.length === 0 ? (
            <p className="text-xs text-gray-400 px-2 italic">No previous chats</p>
          ) : (
            sessions.map(session => (
              <div
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left group transition-colors cursor-pointer ${activeSessionId === session.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquarePlus className={`w-4 h-4 flex-shrink-0 ${activeSessionId === session.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className="text-sm truncate">{session.title}</span>
                </div>
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Bot className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">FluidJobs AI Mentor</h2>
              <p className="text-gray-500 max-w-md mb-8">
                Your intelligent assistant for navigating the recruitment platform. I can help you with creating jobs, managing candidates, and understanding platform workflows.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(prompt)}
                    className="p-4 bg-white border border-gray-200 rounded-xl text-left text-sm text-gray-700 hover:border-indigo-300 hover:shadow-md hover:text-indigo-700 transition-all duration-200 group flex items-start"
                  >
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 px-4 md:px-8 max-w-4xl mx-auto space-y-6">
              {currentMessages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-5 h-5 text-indigo-600" />
                    </div>
                  )}

                  <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 flex flex-col ${msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200'
                    }`}>
                    <div
                      className="text-sm md:text-base leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        // A simple robust replacer. In a full app, use a markdown parser. 
                        __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      }}
                    />
                    <span className={`text-[10px] mt-2 self-end ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}

                </div>
              ))}

              {
                isTyping && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="bg-gray-100 text-gray-800 border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )
              }
              <div ref={messagesEndRef} />
            </div >
          )}
        </div >

        {/* Input Area */}
        < div className="p-4 bg-white border-t border-gray-200" >
          <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-white border border-gray-300 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about using FluidJobs..."
              className="flex-1 max-h-32 min-h-12 bg-transparent resize-none outline-none py-2 px-3 text-gray-700 leading-relaxed"
              rows={inputMessage.split('\n').length > 3 ? 3 : inputMessage.split('\n').length || 1}
            />
            <button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isTyping}
              className="p-3 mb-0.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1 flex-wrap px-4">
            AI Mentor responses are strictly related to platform usage and workflows. It does not have access to passwords, keys, or internal systems.
          </p>
        </div >

      </div >
    </div >
  );
};

export default AIMentor;
