
import React, { useState, useEffect } from 'react';
import { Candidate, InterviewStage } from '../types';

// Extended stages as requested by prompt
const BOARD_STAGES = [
  'Profile Received',
  'Recruiter Shortlist',
  'HM Review',
  'Sent Assignment',
  'Assignment Result',
  'L1 Technical',
  'L2 Technical',
  'L3 Technical',
  'L4 Technical',
  'HR Round',
  'Management',
  'Rejected'
];

// Interview stages that require interviewer assignment
const INTERVIEW_STAGES = [
  'L1 Technical',
  'L2 Technical', 
  'L3 Technical',
  'L4 Technical',
  'HR Round',
  'Management'
];

// Mock interviewers data - this would come from job settings
const AVAILABLE_INTERVIEWERS = [
  { id: '1', name: 'Alice Wong', role: 'Senior Engineer', stages: ['L1 Technical', 'L2 Technical'] },
  { id: '2', name: 'Mark Chen', role: 'Tech Lead', stages: ['L1 Technical', 'L2 Technical', 'L3 Technical'] },
  { id: '3', name: 'Sarah Parker', role: 'Engineering Manager', stages: ['L3 Technical', 'L4 Technical'] },
  { id: '4', name: 'David Blake', role: 'HR Manager', stages: ['HR Round'] },
  { id: '5', name: 'CEO Office', role: 'Management', stages: ['Management'] }
];

// Helper to map board stage to our existing InterviewStage enum where possible
const mapStageToStatus = (boardStage: string): InterviewStage => {
  switch(boardStage) {
    case 'Profile Received': return InterviewStage.SCREENING;
    case 'Recruiter Shortlist': return InterviewStage.CV_SHORTLISTED;
    case 'HM Review': return InterviewStage.CV_SHORTLISTED;
    case 'Sent Assignment': return InterviewStage.ASSIGNMENT;
    case 'Assignment Result': return InterviewStage.ASSIGNMENT;
    case 'L1 Technical': return InterviewStage.L1;
    case 'L2 Technical': return InterviewStage.L2;
    case 'L3 Technical': return InterviewStage.L3;
    case 'L4 Technical': return InterviewStage.L4;
    case 'HR Round': return InterviewStage.HR_ROUND;
    case 'Management': return InterviewStage.MANAGEMENT_ROUND;
    case 'Rejected': return InterviewStage.REJECTED;
    default: return InterviewStage.SCREENING;
  }
};

interface PipelineBoardProps {
  onViewProfile: (id: string) => void;
}

const PipelineBoard: React.FC<PipelineBoardProps> = ({ onViewProfile }) => {
  const [candidates, setCandidates] = useState<any[]>([
    {
      id: 'c1',
      name: 'Sarah Jenkins',
      stage: 'L2 Technical',
      appliedDate: '2024-03-01',
      aging: 10,
      assignmentScore: null,
      status: 'Active',
      interviewer: 'Alice Wong',
      interviewNote: 'Technical interview scheduled for React and Node.js skills'
    },
    {
      id: 'c2',
      name: 'Michael Ross',
      stage: 'Management',
      appliedDate: '2024-02-15',
      aging: 24,
      assignmentScore: null,
      status: 'Active',
      interviewer: 'CEO Office',
      interviewNote: 'Final management round for leadership assessment'
    },
    {
      id: 'c3',
      name: 'Jane Smith',
      stage: 'Profile Received',
      appliedDate: '2024-03-08',
      aging: 2,
      assignmentScore: null,
      status: 'Active',
      interviewer: null,
      interviewNote: null
    },
    {
      id: 'c4',
      name: 'Robert Brown',
      stage: 'Sent Assignment',
      appliedDate: '2024-03-05',
      aging: 5,
      assignmentScore: null,
      status: 'Active',
      interviewer: null,
      interviewNote: null
    },
    {
      id: 'c5',
      name: 'Emma Wilson',
      stage: 'Assignment Result',
      appliedDate: '2024-03-03',
      aging: 7,
      assignmentScore: 92,
      status: 'Active',
      interviewer: null,
      interviewNote: null
    }
  ]);

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [openStageMenu, setOpenStageMenu] = useState<string | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreCandidate, setScoreCandidate] = useState<any>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [showInterviewerModal, setShowInterviewerModal] = useState(false);
  const [interviewCandidate, setInterviewCandidate] = useState<any>(null);
  const [selectedInterviewer, setSelectedInterviewer] = useState('');
  const [interviewNote, setInterviewNote] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openStageMenu) {
        setOpenStageMenu(null);
      }
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openStageMenu, openDropdown]);

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('candidateId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('candidateId');
    if (id) {
      const candidate = candidates.find(c => c.id === id);
      if (candidate) {
        if (targetStage === 'Assignment Result' && !candidate.assignmentScore) {
          // Show score input modal for Assignment Result stage
          setScoreCandidate({ ...candidate, newStage: targetStage });
          setShowScoreModal(true);
        } else if (INTERVIEW_STAGES.includes(targetStage)) {
          // Show interviewer assignment modal for interview stages
          const availableInterviewers = AVAILABLE_INTERVIEWERS.filter(interviewer => 
            interviewer.stages.includes(targetStage)
          );
          
          if (availableInterviewers.length === 1) {
            // Auto-assign if only one interviewer available
            setCandidates(prev => prev.map(c => 
              c.id === id ? { 
                ...c, 
                stage: targetStage, 
                interviewer: availableInterviewers[0].name,
                interviewNote: `Automatically assigned to ${availableInterviewers[0].name} for ${targetStage}`,
                lastUpdateDate: new Date().toISOString().split('T')[0] 
              } : c
            ));
          } else {
            // Show interviewer selection modal
            setInterviewCandidate({ ...candidate, newStage: targetStage });
            setShowInterviewerModal(true);
          }
        } else {
          // Normal stage change
          setCandidates(prev => prev.map(c => 
            c.id === id ? { ...c, stage: targetStage, lastUpdateDate: new Date().toISOString().split('T')[0] } : c
          ));
        }
      }
    }
    setDraggedId(null);
  };

  const handleStageChange = (candidateId: string, newStage: string) => {
    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? { ...c, stage: newStage, lastUpdateDate: new Date().toISOString().split('T')[0] } : c
    ));
    setOpenDropdown(null);
  };

  // Filter candidates for list view
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.interviewer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = !stageFilter || candidate.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Stage action handlers
  const handleStageAction = (stage: string, action: string) => {
    switch (action) {
      case 'bulk_move':
        alert(`Bulk move all candidates from ${stage} to next stage`);
        break;
      case 'export':
        alert(`Export ${stage} candidates to CSV`);
        break;
      default:
        break;
    }
    setOpenStageMenu(null);
  };

  // Candidate action handlers
  const handleCandidateAction = (candidateId: string, action: 'dropped' | 'rejected' | 'reactivate') => {
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        if (action === 'dropped') {
          return { ...c, status: 'Dropped' };
        } else if (action === 'rejected') {
          return { ...c, stage: 'Rejected', status: 'Rejected' };
        } else if (action === 'reactivate') {
          return { ...c, status: 'Active' };
        }
      }
      return c;
    }));
  };

  // Handle score submission
  const handleScoreSubmit = () => {
    const score = parseInt(scoreInput);
    if (score >= 0 && score <= 100 && scoreCandidate) {
      setCandidates(prev => prev.map(c => 
        c.id === scoreCandidate.id ? { 
          ...c, 
          stage: scoreCandidate.newStage, 
          assignmentScore: score,
          lastUpdateDate: new Date().toISOString().split('T')[0] 
        } : c
      ));
      setShowScoreModal(false);
      setScoreCandidate(null);
      setScoreInput('');
    }
  };

  const handleScoreCancel = () => {
    setShowScoreModal(false);
    setScoreCandidate(null);
    setScoreInput('');
  };

  // Handle interviewer assignment
  const handleInterviewerSubmit = () => {
    if (selectedInterviewer && interviewCandidate) {
      const interviewer = AVAILABLE_INTERVIEWERS.find(i => i.id === selectedInterviewer);
      setCandidates(prev => prev.map(c => 
        c.id === interviewCandidate.id ? { 
          ...c, 
          stage: interviewCandidate.newStage, 
          interviewer: interviewer?.name,
          interviewNote: interviewNote || `Assigned to ${interviewer?.name} for ${interviewCandidate.newStage}`,
          lastUpdateDate: new Date().toISOString().split('T')[0] 
        } : c
      ));
      setShowInterviewerModal(false);
      setInterviewCandidate(null);
      setSelectedInterviewer('');
      setInterviewNote('');
    }
  };

  const handleInterviewerCancel = () => {
    setShowInterviewerModal(false);
    setInterviewCandidate(null);
    setSelectedInterviewer('');
    setInterviewNote('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Hiring Pipeline</h1>
          <p className="text-sm text-gray-600">Drag and drop candidates to update their hiring stage.</p>
        </div>
        <div className="flex gap-2">
           <div className="flex bg-white rounded-lg border border-gray-200 p-1">
             <button 
               onClick={() => setViewMode('board')}
               className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                 viewMode === 'board' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
               }`}
             >
               Board View
             </button>
             <button 
               onClick={() => setViewMode('list')}
               className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                 viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
               }`}
             >
               List View
             </button>
           </div>
        </div>
      </div>

      {viewMode === 'board' ? (
        /* Board View */
        <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-4 pb-4 select-none">
          {BOARD_STAGES.map(stage => {
            const columnCandidates = candidates.filter(c => c.stage === stage);
            return (
              <div 
                key={stage} 
                className={`flex-shrink-0 w-80 flex flex-col bg-gray-100/50 rounded-xl border border-gray-200/60 transition-colors ${draggedId ? 'ring-2 ring-blue-500/10 ring-inset' : ''}`}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, stage)}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{stage}</h3>
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-200 text-gray-700 text-[11px] font-bold rounded-full leading-none">{columnCandidates.length}</span>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setOpenStageMenu(openStageMenu === stage ? null : stage)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-all"
                    >
                      <i className="fa-solid fa-ellipsis"></i>
                    </button>
                    
                    {openStageMenu === stage && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
                        <div className="p-2">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1">
                            {stage} Actions
                          </div>
                          
                          {columnCandidates.length === 0 ? (
                            /* Empty State */
                            <div className="px-3 py-8 text-center">
                              <i className="fa-solid fa-inbox text-2xl text-gray-300 mb-2"></i>
                              <p className="text-xs text-gray-400 font-medium">No candidates in this stage</p>
                            </div>
                          ) : (
                            /* Actions when candidates exist */
                            <>
                              {/* Bulk Actions */}
                              <button
                                onClick={() => handleStageAction(stage, 'bulk_move')}
                                className="w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all flex items-center gap-3 text-blue-700 hover:bg-blue-50"
                              >
                                <i className="fa-solid fa-arrow-right text-xs"></i>
                                <span className="font-medium">Bulk Move to Next Stage</span>
                              </button>
                              
                              {/* Export */}
                              <div className="border-t border-gray-100 mt-2 pt-2">
                                <button
                                  onClick={() => handleStageAction(stage, 'export')}
                                  className="w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all flex items-center gap-3 text-gray-700 hover:bg-gray-50"
                                >
                                  <i className="fa-solid fa-download text-xs"></i>
                                  <span className="font-medium">Export Candidates</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 space-y-3 pb-4 scrollbar-thin scrollbar-thumb-gray-200">
                  {columnCandidates.map(candidate => (
                    <div
                      key={candidate.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, candidate.id)}
                      onClick={() => onViewProfile(candidate.id)}
                      className={`bg-white p-4 rounded-xl border border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-all group ${draggedId === candidate.id ? 'opacity-40 grayscale' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{candidate.name}</h4>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-xs font-medium ${candidate.aging > 15 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                          {candidate.aging}d aging
                        </div>
                      </div>

                      {/* Applied Date */}
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 font-medium">
                          Applied: {candidate.appliedDate}
                        </div>
                      </div>

                      {/* Assignment Score (show as progress bar if score exists) */}
                      {candidate.assignmentScore && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-600 font-medium mb-1">
                            Assignment Score: <span className="font-bold text-green-600">{candidate.assignmentScore}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  candidate.assignmentScore >= 80 ? 'bg-green-500' : 
                                  candidate.assignmentScore >= 60 ? 'bg-yellow-500' : 
                                  'bg-red-500'
                                }`} 
                                style={{ width: `${candidate.assignmentScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Interviewer Information (show if assigned) */}
                      {candidate.interviewer && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                              <i className="fa-solid fa-user-tie text-blue-600 text-[8px]"></i>
                            </div>
                            <span className="font-medium text-gray-700">{candidate.interviewer}</span>
                          </div>
                          {candidate.interviewNote && (
                            <div className="mt-1 text-xs text-gray-500 italic pl-6">
                              "{candidate.interviewNote}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Status Display */}
                      <div className="mb-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          candidate.status === 'Active' ? 'bg-green-100 text-green-700' :
                          candidate.status === 'Dropped' ? 'bg-yellow-100 text-yellow-700' :
                          candidate.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {candidate.status}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                        {candidate.status === 'Active' ? (
                          <>
                            <button
                              onClick={() => handleCandidateAction(candidate.id, 'dropped')}
                              className="flex-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-lg hover:bg-yellow-100 transition-all"
                            >
                              Dropped
                            </button>
                            <button
                              onClick={() => handleCandidateAction(candidate.id, 'rejected')}
                              className="flex-1 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-all"
                            >
                              Reject
                            </button>
                          </>
                        ) : candidate.status === 'Dropped' ? (
                          <button
                            onClick={() => handleCandidateAction(candidate.id, 'reactivate')}
                            className="w-full px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-all"
                          >
                            Reactivate
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  {columnCandidates.length === 0 && (
                     <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-300 gap-1">
                        <i className="fa-solid fa-plus text-xs"></i>
                        <span className="text-xs font-medium uppercase tracking-wider">Drop Here</span>
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {/* Search and Filter Controls for List View */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3">
              {/* Search Field */}
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Search candidates or interviewers..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-normal focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-gray-400 text-sm"></i>
              </div>

              {/* Stage Filter */}
              <select 
                className="bg-gray-50 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="">All Stages</option>
                {BOARD_STAGES.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>

              {/* Clear Filters */}
              {(searchQuery || stageFilter) && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setStageFilter('');
                  }}
                  className="text-xs font-medium text-blue-600 uppercase hover:underline px-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Current Stage</th>
                  <th className="px-6 py-4">Assignment Score</th>
                  <th className="px-6 py-4">Interviewer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Aging</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCandidates.map(candidate => (
                  <tr 
                    key={candidate.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onViewProfile(candidate.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={`https://i.pravatar.cc/150?u=${candidate.id}`} className="w-9 h-9 rounded-full border border-gray-200" />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">{candidate.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {candidate.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {candidate.assignmentScore ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                candidate.assignmentScore >= 80 ? 'bg-green-500' : 
                                candidate.assignmentScore >= 60 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`} 
                              style={{ width: `${candidate.assignmentScore}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700">{candidate.assignmentScore}%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {candidate.interviewer ? (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                              <i className="fa-solid fa-user-tie text-blue-600 text-[8px]"></i>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{candidate.interviewer}</span>
                          </div>
                          {candidate.interviewNote && (
                            <div className="mt-1 text-xs text-gray-500 italic pl-6 truncate max-w-[200px]" title={candidate.interviewNote}>
                              "{candidate.interviewNote}"
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        candidate.status === 'Active' ? 'bg-green-100 text-green-700' :
                        candidate.status === 'Dropped' ? 'bg-yellow-100 text-yellow-700' :
                        candidate.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${candidate.aging > 15 ? 'text-red-600' : 'text-gray-600'}`}>
                        {candidate.aging} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{candidate.appliedDate}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {/* Status Action Buttons */}
                        {candidate.status === 'Active' ? (
                          <>
                            <button
                              onClick={() => handleCandidateAction(candidate.id, 'dropped')}
                              className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded hover:bg-yellow-100 transition-all"
                            >
                              Drop
                            </button>
                            <button
                              onClick={() => handleCandidateAction(candidate.id, 'rejected')}
                              className="px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded hover:bg-red-100 transition-all"
                            >
                              Reject
                            </button>
                          </>
                        ) : candidate.status === 'Dropped' ? (
                          <button
                            onClick={() => handleCandidateAction(candidate.id, 'reactivate')}
                            className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded hover:bg-green-100 transition-all"
                          >
                            Reactivate
                          </button>
                        ) : null}
                        
                        {/* Stage Move Dropdown */}
                        <div className="relative">
                          <button 
                            onClick={() => setOpenDropdown(openDropdown === candidate.id ? null : candidate.id)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                            title="Change Stage"
                          >
                            <span>Move to</span>
                            <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${openDropdown === candidate.id ? 'rotate-180' : ''}`}></i>
                          </button>
                        {openDropdown === candidate.id && (
                          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 z-50 overflow-hidden">
                            <div className="p-2">
                              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1">
                                Move to Stage
                              </div>
                              <div className="max-h-64 overflow-y-auto">
                                {BOARD_STAGES.filter(stage => stage !== candidate.stage).map((stage, index) => {
                                  const isProgression = BOARD_STAGES.indexOf(stage) > BOARD_STAGES.indexOf(candidate.stage);
                                  const isRegression = BOARD_STAGES.indexOf(stage) < BOARD_STAGES.indexOf(candidate.stage);
                                  
                                  return (
                                    <button
                                      key={stage}
                                      onClick={() => handleStageChange(candidate.id, stage)}
                                      className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all flex items-center justify-between group ${
                                        isProgression 
                                          ? 'text-green-700 hover:bg-green-50 hover:text-green-800' 
                                          : isRegression 
                                          ? 'text-orange-700 hover:bg-orange-50 hover:text-orange-800'
                                          : 'text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      <span className="font-medium">{stage}</span>
                                      <div className="flex items-center gap-1">
                                        {isProgression && (
                                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                                            Forward
                                          </span>
                                        )}
                                        {isRegression && (
                                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                                            Back
                                          </span>
                                        )}
                                        <i className={`fa-solid text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ${
                                          isProgression ? 'fa-arrow-right text-green-600' : 
                                          isRegression ? 'fa-arrow-left text-orange-600' : 
                                          'fa-arrow-right text-gray-400'
                                        }`}></i>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCandidates.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <i className="fa-solid fa-magnifying-glass text-3xl opacity-30"></i>
                <p className="text-sm font-medium">
                  {searchQuery || stageFilter ? 'No candidates match your current filter criteria.' : 'No candidates found.'}
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* Score Input Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Enter Assignment Score</h3>
              <p className="text-sm text-gray-600 mt-1">
                Please enter the assignment score for <span className="font-medium">{scoreCandidate?.name}</span>
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter score (e.g., 85)"
                    autoFocus
                  />
                </div>
                
                {scoreInput && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-600 font-medium mb-1">Preview:</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            parseInt(scoreInput) >= 80 ? 'bg-green-500' : 
                            parseInt(scoreInput) >= 60 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`} 
                          style={{ width: `${Math.min(100, Math.max(0, parseInt(scoreInput) || 0))}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700">{scoreInput}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleScoreCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleScoreSubmit}
                disabled={!scoreInput || parseInt(scoreInput) < 0 || parseInt(scoreInput) > 100}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Save Score
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interviewer Assignment Modal */}
      {showInterviewerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Assign Interviewer</h3>
              <p className="text-sm text-gray-600 mt-1">
                Assign an interviewer for <span className="font-medium">{interviewCandidate?.name}</span> - {interviewCandidate?.newStage}
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Interviewer
                  </label>
                  <select
                    value={selectedInterviewer}
                    onChange={(e) => setSelectedInterviewer(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Choose an interviewer...</option>
                    {AVAILABLE_INTERVIEWERS
                      .filter(interviewer => interviewer.stages.includes(interviewCandidate?.newStage))
                      .map(interviewer => (
                        <option key={interviewer.id} value={interviewer.id}>
                          {interviewer.name} - {interviewer.role}
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Note (Optional)
                  </label>
                  <textarea
                    value={interviewNote}
                    onChange={(e) => setInterviewNote(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    rows={3}
                    placeholder="Add any specific notes for this interview (e.g., focus areas, special requirements...)"
                  />
                </div>
                
                {selectedInterviewer && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-700 font-medium mb-1">Preview:</div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                        <i className="fa-solid fa-user-tie text-blue-600 text-[8px]"></i>
                      </div>
                      <span className="font-medium text-gray-700">
                        {AVAILABLE_INTERVIEWERS.find(i => i.id === selectedInterviewer)?.name}
                      </span>
                    </div>
                    {interviewNote && (
                      <div className="mt-1 text-xs text-gray-500 italic pl-6">
                        "{interviewNote}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleInterviewerCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleInterviewerSubmit}
                disabled={!selectedInterviewer}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Assign Interviewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineBoard;
