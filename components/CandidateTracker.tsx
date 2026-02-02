
import React, { useState, useMemo } from 'react';
import { Candidate, InterviewStage } from '../types';
import { STATUS_COLORS } from '../constants';
import GlobalFilters from './GlobalFilters';

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 555-0123',
    jobTitle: 'Senior Frontend Engineer',
    department: 'Engineering',
    source: 'LinkedIn',
    currentStage: InterviewStage.L2,
    appliedDate: '2024-03-01',
    lastUpdateDate: '2024-03-20',
    experience: '6.5 Years',
    location: 'Remote',
    cvStatusRecruiter: 'Shortlisted',
    cvStatusHM: 'Shortlisted',
    assignmentDate: '2024-03-03',
    assignmentStatus: 'Evaluated',
    assignmentScore: 85,
    interviews: {
      l1: { interviewer: 'Mark Chen', date: '2024-03-05', feedbackDate: '2024-03-05', status: 'Cleared', score: 4.5 },
      l2: { interviewer: 'Alice Wong', date: '2024-03-10', feedbackDate: '', status: 'Scheduled' },
      l3: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' },
      l4: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' },
      hr: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' },
      management: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' },
    },
    ctc: { current: 145000, expected: 165000, currency: 'USD' },
    noticePeriod: '30 Days',
    comments: ['Strong React skills'],
  },
  {
    id: '2',
    name: 'Michael Ross',
    email: 'mross@example.com',
    phone: '+1 555-9876',
    jobTitle: 'Product Manager',
    department: 'Product',
    source: 'Referral',
    currentStage: InterviewStage.OFFER_EXTENDED,
    appliedDate: '2024-02-15',
    lastUpdateDate: '2024-03-08',
    experience: '8 Years',
    location: 'On-site',
    cvStatusRecruiter: 'Shortlisted',
    cvStatusHM: 'Shortlisted',
    assignmentDate: '2024-02-18',
    assignmentStatus: 'Evaluated',
    assignmentScore: 92,
    interviews: {
      l1: { interviewer: 'David Blake', date: '2024-02-20', feedbackDate: '2024-02-21', status: 'Cleared', score: 5 },
      l2: { interviewer: 'Sarah Stone', date: '2024-02-25', feedbackDate: '2024-02-26', status: 'Cleared', score: 4.8 },
      l3: { interviewer: 'Jason Bourne', date: '2024-03-01', feedbackDate: '2024-03-02', status: 'Cleared', score: 4.7 },
      l4: { interviewer: 'Elena Gilbert', date: '2024-03-05', feedbackDate: '2024-03-05', status: 'Cleared', score: 4.9 },
      hr: { interviewer: 'Alex Thompson', date: '2024-03-07', feedbackDate: '2024-03-07', status: 'Cleared' },
      management: { interviewer: 'CEO Office', date: '2024-03-08', feedbackDate: '2024-03-08', status: 'Cleared' },
    },
    ctc: { current: 160000, expected: 185000, currency: 'USD' },
    noticePeriod: 'Immediate',
    offerReleaseDate: '2024-03-09',
    comments: ['Excellent stakeholder management'],
  },
  {
    id: '3',
    name: 'Emily Blunt',
    email: 'eblunt@example.com',
    phone: '+1 555-3344',
    jobTitle: 'Backend Developer',
    department: 'Engineering',
    source: 'Referral',
    currentStage: InterviewStage.L1,
    appliedDate: '2024-02-01',
    lastUpdateDate: '2024-02-10',
    experience: '5 Years',
    location: 'Hybrid',
    cvStatusRecruiter: 'Shortlisted',
    cvStatusHM: 'Shortlisted',
    interviews: {
      l1: { interviewer: 'Mark Chen', date: '2024-02-12', feedbackDate: '', status: 'Scheduled' },
      l2: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' },
      l3: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' },
      l4: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' },
      hr: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' },
      management: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' },
    },
    ctc: { current: 120000, expected: 150000, currency: 'USD' },
    noticePeriod: '90 Days',
    comments: ['High notice period concerns'],
  }
];

interface TrackerProps {
  onAddCandidate: () => void;
  onViewProfile: (id: string) => void;
}

const CandidateTracker: React.FC<TrackerProps> = ({ onAddCandidate, onViewProfile }) => {
  const [activeFilters, setActiveFilters] = useState<any>({});

  const filteredCandidates = useMemo(() => {
    return MOCK_CANDIDATES.filter(c => {
      const q = activeFilters.query?.toLowerCase() || '';
      const matchesQuery = c.name.toLowerCase().includes(q) || c.jobTitle.toLowerCase().includes(q);
      const matchesStatus = !activeFilters.status || c.currentStage === activeFilters.status;
      const matchesPosition = !activeFilters.position || c.jobTitle === activeFilters.position;
      const matchesNotice = !activeFilters.notice || c.noticePeriod === activeFilters.notice;
      const matchesLocation = !activeFilters.location || c.location === activeFilters.location;
      return matchesQuery && matchesStatus && matchesPosition && matchesNotice && matchesLocation;
    });
  }, [activeFilters]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Candidate Tracker</h1>
          <p className="text-sm text-gray-600">Advanced global search capabilities and candidate management.</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={onAddCandidate}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all"
           >
             Add Candidate
           </button>
        </div>
      </div>

      <GlobalFilters onFilterChange={setActiveFilters} activeFilters={activeFilters} />

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Notice Period</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCandidates.map(c => {
                return (
                  <React.Fragment key={c.id}>
                    <tr 
                      className={`hover:bg-gray-50 transition-colors cursor-pointer`}
                      onClick={() => onViewProfile(c.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={`https://picsum.photos/seed/${c.id}/40/40`} className="w-9 h-9 rounded-full border border-gray-200" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{c.name}</span>
                            <span className="text-[11px] text-gray-400">{c.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-gray-700">{c.email}</span>
                          <span className="text-xs text-gray-500">{c.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold ${c.noticePeriod.includes('60') || c.noticePeriod.includes('90') ? 'text-red-600' : 'text-gray-600'}`}>
                          {c.noticePeriod}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow-sm ${STATUS_COLORS[c.currentStage] || 'bg-gray-100 text-gray-600'}`}>
                           {c.currentStage}
                         </span>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {filteredCandidates.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <i className="fa-solid fa-magnifying-glass text-3xl opacity-30"></i>
              <p className="text-sm font-medium">No candidates match your current filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateTracker;
