import React, { useState } from 'react';
import CandidateRow from '../../components/CandidateRow';
import CandidateDetailModal from '../../components/CandidateDetailModal';

const mockCandidates = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', status: 'Active', role: 'Developer', bio: 'Frontend specialist.' },
  { id: 2, name: 'Bob Jones', email: 'bob@example.com', status: 'Inactive', role: 'Designer', bio: 'UI/UX expert.' },
];

const CandidateList: React.FC = () => {
  const [selected, setSelected] = useState<typeof mockCandidates[0] | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<'name' | 'role'>('name');

  const filtered = mockCandidates
    .filter(c => (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())))
    .filter(c => (!status || c.status === status))
    .sort((a, b) => a[sort].localeCompare(b[sort]));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Candidates</h1>
      <div className="flex gap-4 mb-4">
        <input placeholder="Search" className="border p-2" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="border p-2" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select className="border p-2" value={sort} onChange={e => setSort(e.target.value as 'name' | 'role')}>
          <option value="name">Sort by Name</option>
          <option value="role">Sort by Role</option>
        </select>
      </div>
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Role</th>
            <th className="py-2 px-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(c => (
            <CandidateRow key={c.id} candidate={c} onClick={() => setSelected(c)} />
          ))}
        </tbody>
      </table>
      {selected && (
        <CandidateDetailModal candidate={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default CandidateList;
