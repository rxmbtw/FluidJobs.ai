import React, { useState } from 'react';
import JobCard from '../../components/JobCard';
import JobDetailModal from '../../components/JobDetailModal';

const mockJobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Remote',
    type: 'Full-time',
    status: 'Open',
    description: 'Build and maintain UI components.'
  },
  {
    id: 2,
    title: 'Backend Engineer',
    company: 'BizSoft',
    location: 'New York',
    type: 'Part-time',
    status: 'Closed',
    description: 'Develop server-side logic.'
  },
];

const JobsList: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<typeof mockJobs[0] | null>(null);
  const [filters, setFilters] = useState({ title: '', company: '', location: '', type: '', status: '' });

  const filteredJobs = mockJobs.filter(job =>
    (!filters.title || job.title.toLowerCase().includes(filters.title.toLowerCase())) &&
    (!filters.company || job.company.toLowerCase().includes(filters.company.toLowerCase())) &&
    (!filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
    (!filters.type || job.type === filters.type) &&
    (!filters.status || job.status === filters.status)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Jobs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input placeholder="Title" className="border p-2" value={filters.title} onChange={e => setFilters(f => ({ ...f, title: e.target.value }))} />
        <input placeholder="Company" className="border p-2" value={filters.company} onChange={e => setFilters(f => ({ ...f, company: e.target.value }))} />
        <input placeholder="Location" className="border p-2" value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))} />
        <select className="border p-2" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          <option value="">Type</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
        </select>
        <select className="border p-2" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">Status</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
      <div>
        {filteredJobs.map(job => (
          <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
        ))}
      </div>
      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
};

export default JobsList;
