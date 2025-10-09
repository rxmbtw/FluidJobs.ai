import React from 'react';

interface CompanyCardProps {
  company: {
    id: number;
    name: string;
    location: string;
    industry: string;
    status: string;
  };
  onClick?: () => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onClick }) => (
  <div className="bg-white rounded shadow p-4 mb-4 cursor-pointer" onClick={onClick}>
    <h3 className="text-lg font-bold">{company.name}</h3>
    <p className="text-sm text-gray-600">{company.location} &mdash; {company.industry}</p>
    <span className={`px-2 py-1 rounded ${company.status === 'Active' ? 'bg-status-success text-white' : 'bg-status-error text-white'}`}>{company.status}</span>
  </div>
);

export default CompanyCard;
