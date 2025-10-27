import React from 'react';

interface CompanyDetailModalProps {
  company: {
    id: number;
    name: string;
    location: string;
    industry: string;
    status: string;
    description: string;
  };
  onClose: () => void;
}

const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({ company, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded p-6 w-full max-w-lg relative">
      <button className="absolute top-2 right-2" onClick={onClose}>✕</button>
      <h2 className="text-xl font-bold mb-2">{company.name}</h2>
      <p className="mb-1">Location: {company.location}</p>
      <p className="mb-1">Industry: {company.industry}</p>
      <p className="mb-1">Status: {company.status}</p>
      <p className="mb-4">{company.description}</p>
    </div>
  </div>
);

export default CompanyDetailModal;
