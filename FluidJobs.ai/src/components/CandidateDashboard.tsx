import React, { useState } from 'react';
import { 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Send,
  MoreHorizontal,
  Briefcase,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';

interface Post {
  id: number;
  author: string;
  authorRole: string;
  timestamp: string;
  title: string;
  description: string;
  hasMedia: boolean;
  likes: number;
  comments: number;
  shares: number;
}

const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [posts] = useState<Post[]>([
    {
      id: 1,
      author: 'FluidJobs.ai',
      authorRole: 'Admin',
      timestamp: '14 days ago',
      title: 'Job Opportunities Available!',
      description: "We're pleased to share exciting new job openings. Discover roles in various departments and find the perfect fit for your skills and career goals.",
      hasMedia: true,
      likes: 0,
      comments: 0,
      shares: 0
    }
  ]);
  const [commentText, setCommentText] = useState('');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Feed (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Post Header */}
            <div className="p-5 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">BY {post.author.toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{post.timestamp}</p>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Post Content */}
            <div className="px-5 pb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-purple-600 cursor-pointer transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-700 text-[15px] leading-relaxed">
                {post.description}
                <span className="text-purple-600 hover:text-purple-700 cursor-pointer ml-1">...more</span>
              </p>
            </div>

            {/* Embedded Media Card */}
            {post.hasMedia && (
              <div className="mx-5 mb-5">
                <div className="bg-gradient-to-r from-[#7E57C2] to-[#4A148C] rounded-xl p-8 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-sm opacity-80 mb-2">Opportunity moves fast. So should you.</p>
                    <h3 className="text-3xl font-bold mb-4 leading-tight">
                      Curious minds, here's<br />your time to shine!
                    </h3>
                    <p className="text-xl font-semibold mb-2">FLUIDJOBS.AI RECRUITMENT DRIVE</p>
                    <p className="text-lg font-semibold mb-1">ENTRY OPEN!</p>
                    <p className="text-sm">Participate now!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Post Footer - Actions */}
            <div className="px-5 pb-4 space-y-4">
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors">
                  <ThumbsUp className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.comments}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.shares}</span>
                </button>
              </div>

              {/* Comment Input */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                  {(user as any)?.profileImage ? (
                    <img 
                      src={(user as any).profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 flex items-center bg-[#F0F2F5] rounded-full px-4 py-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                  />
                  <button className="ml-2 text-purple-600 hover:text-purple-700 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Column - Opportunities Widget (1/3 width) */}
      <div className="lg:col-span-1">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Briefcase className="w-6 h-6 text-[#673AB7]" />
              <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide">OPPORTUNITIES</h3>
            </div>
            <div className="mt-4">
              <p className="text-5xl font-bold text-[#673AB7] leading-none">21</p>
              <p className="text-sm text-gray-600 mt-2">Opportunities for which you are Eligible</p>
            </div>
          </div>

          <button 
            onClick={() => window.location.href = '/resumes'}
            className="w-full bg-[#673AB7] hover:bg-[#5E35B1] text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Generate Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;