import React, { useState } from 'react';
import CompanyCard from '../../components/CompanyCard';
import CompanyDetailModal from '../../components/CompanyDetailModal';

const mockCompanies = [
  { id: 1, name: 'TechCorp', location: 'Remote', industry: 'Software', status: 'Active', description: 'Leading software solutions.' },
  { id: 2, name: 'BizSoft', location: 'New York', industry: 'Finance', status: 'Inactive', description: 'Financial services provider.' },
];

const CompanyList: React.FC = () => {
  const [selected, setSelected] = useState<typeof mockCompanies[0] | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Companies</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {mockCompanies.map(company => (
          <CompanyCard key={company.id} company={company} onClick={() => setSelected(company)} />
        ))}
      </div>
      {selected && (
        <CompanyDetailModal company={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default CompanyList;
