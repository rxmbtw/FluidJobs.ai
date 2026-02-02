
import React from 'react';

interface CandidateProfileProps {
  candidateId: string;
  onBack: () => void;
}

const CandidateProfile: React.FC<CandidateProfileProps> = ({ candidateId, onBack }) => {
  // Mock detailed candidate data
  const candidate = {
    name: 'Sarah Jenkins',
    title: 'Senior Frontend Engineer',
    email: 'sarah.jenkins@techcorp.com',
    phone: '+1 (555) 902-3481',
    location: 'Austin, TX (Remote)',
    experience: '7.5 Years',
    source: 'LinkedIn Premium',
    currentStatus: 'Offer Accepted',
    ctc: { current: '$145k', expected: '$170k', offered: '$168k' },
    noticePeriod: '30 Days',
    avatar: 'https://picsum.photos/seed/sarah/200/200',
    tags: ['React', 'TypeScript', 'System Design', 'Team Lead'],
    comments: [
      { user: 'Alex Thompson', date: '2024-03-01', text: 'Highly recommended from initial screening. Cultural fit is excellent.' },
      { user: 'Mark Chen', date: '2024-03-12', text: 'Technically very sound. Solved the complex state management problem with ease.' }
    ]
  };

  const timelineSteps = [
    {
      stage: 'Application Received',
      date: 'March 01, 2024',
      status: 'Completed',
      icon: 'fa-paper-plane',
      color: 'blue',
      details: 'Applied via LinkedIn for Senior Frontend Role. Resume parsed successfully.'
    },
    {
      stage: 'Screening & CV Review',
      date: 'March 02, 2024',
      status: 'Shortlisted',
      icon: 'fa-file-magnifying-glass',
      color: 'indigo',
      details: 'Recruiter Status: Approved. HM Status: Shortlisted for technical rounds.'
    },
    {
      stage: 'Technical Assignment',
      date: 'March 05, 2024',
      status: 'Passed (92%)',
      icon: 'fa-laptop-code',
      color: 'purple',
      details: 'Architecture: 10/10, Performance: 9/10, Testing: 8/10. Reviewer: Mark Chen.'
    },
    {
      stage: 'Level 1: Core JavaScript',
      date: 'March 08, 2024',
      status: 'Cleared',
      icon: 'fa-code',
      color: 'sky',
      details: 'Interviewer: David Blake. Feedback: Expert knowledge in async patterns and closures.'
    },
    {
      stage: 'Level 2: React & Frontend Arch',
      date: 'March 10, 2024',
      status: 'Cleared',
      icon: 'fa-layer-group',
      color: 'sky',
      details: 'Interviewer: Alice Wong. Feedback: Strong grasp of component life-cycles and design systems.'
    },
    {
      stage: 'Level 3 & 4: System Design',
      date: 'March 14, 2024',
      status: 'Cleared',
      icon: 'fa-diagram-project',
      color: 'sky',
      details: 'Interviewer: Jason Bourne. Feedback: Excellent at scaling frontend applications. High leadership potential.'
    },
    {
      stage: 'HR & Management Round',
      date: 'March 16, 2024',
      status: 'Cleared',
      icon: 'fa-user-tie',
      color: 'amber',
      details: 'Interviewer: CEO Office. Feedback: Vision aligns with company goals. Salaries discussed.'
    },
    {
      stage: 'Offer Released',
      date: 'March 18, 2024',
      status: 'Accepted',
      icon: 'fa-file-contract',
      color: 'emerald',
      details: 'Offer accepted within 48 hours. Joining date confirmed for April 15.'
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Back Button */}
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Back to Candidates
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar: Profile Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden sticky top-24">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div className="px-6 pb-8 -mt-12 text-center">
              <img src={candidate.avatar} alt={candidate.name} className="w-24 h-24 rounded-2xl border-4 border-white mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900">{candidate.name}</h2>
              <p className="text-sm font-medium text-slate-500 mb-4">{candidate.title}</p>
              
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">
                  {candidate.currentStatus}
                </span>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full border border-blue-100">
                  {candidate.source}
                </span>
              </div>

              <div className="flex gap-2 justify-center mb-8">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
                  <i className="fa-solid fa-envelope"></i>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
                  <i className="fa-solid fa-phone"></i>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
                  <i className="fa-brands fa-linkedin"></i>
                </button>
              </div>

              <div className="space-y-4 text-left pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Experience</span>
                  <span className="text-slate-900 font-bold">{candidate.experience}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Location</span>
                  <span className="text-slate-900 font-bold">{candidate.location}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Notice Period</span>
                  <span className="text-slate-900 font-bold">{candidate.noticePeriod}</span>
                </div>
                <div className="pt-4 space-y-2">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Key Skills</p>
                   <div className="flex flex-wrap gap-2">
                      {candidate.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200">
                          {tag}
                        </span>
                      ))}
                   </div>
                </div>
              </div>

              <button className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <i className="fa-solid fa-file-pdf"></i> Download Resume
              </button>
            </div>
          </div>
        </div>

        {/* Right Content: Hiring Timeline & Journey */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200">
             <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-bold text-slate-900">Hiring Journey Timeline</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all">Move to Next Stage</button>
                  <button className="p-2 text-slate-400 hover:text-rose-500 rounded-lg"><i className="fa-solid fa-user-minus"></i></button>
                </div>
             </div>

             <div className="relative pl-8 border-l-2 border-dashed border-slate-100 space-y-12 ml-4">
                {timelineSteps.map((step, i) => (
                  <div key={i} className="relative">
                    {/* Circle Icon */}
                    <div className={`absolute -left-[45px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-xs text-white bg-${step.color}-500`}>
                      <i className={`fa-solid ${step.icon}`}></i>
                    </div>
                    
                    {/* Content */}
                    <div className="group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                         <h4 className="font-bold text-slate-900">{step.stage}</h4>
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{step.date}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              step.status.includes('Passed') || step.status === 'Cleared' || step.status === 'Accepted' || step.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {step.status}
                            </span>
                         </div>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-transparent group-hover:border-slate-100 group-hover:bg-white transition-all">
                        {step.details}
                      </p>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Internal Comments Section */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200">
             <h3 className="text-lg font-bold text-slate-900 mb-6">Internal Reviewer Comments</h3>
             <div className="space-y-6 mb-8">
                {candidate.comments.map((comment, i) => (
                  <div key={i} className="flex gap-4">
                    <img src={`https://picsum.photos/seed/${comment.user}/40/40`} className="w-10 h-10 rounded-full border border-slate-100 flex-shrink-0" />
                    <div className="flex-1 p-4 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-slate-900">{comment.user}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase">{comment.date}</span>
                      </div>
                      <p className="text-sm text-slate-600">{comment.text}</p>
                    </div>
                  </div>
                ))}
             </div>
             <div className="flex gap-4">
                <img src="https://picsum.photos/seed/user/40/40" className="w-10 h-10 rounded-full border border-slate-100 flex-shrink-0" />
                <div className="flex-1 relative">
                  <textarea 
                    placeholder="Add an internal note or feedback..." 
                    className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                  />
                  <button className="absolute bottom-3 right-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all">
                    Post Comment
                  </button>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CandidateProfile;
