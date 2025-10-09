import React, { useState } from 'react';
import { Droplet, Plus, Briefcase, Mail, Calendar, BarChart, Users, MapPin, Clock, DollarSign, Loader2 } from 'lucide-react';

const JobOpeningsDashboard: React.FC = () => {
  const [activeNav, setActiveNav] = useState('view_opening');

  const jobOpenings = [
    {
      id: 'jpeueQhz',
      title: 'Software Developer Engineer (SDE)',
      description: 'You Are Hiring For A Software Developer Engineer (sde) Role Requiring A Minimum Of 2 Years Of Experience. The Position Highlights Key Skills Such As Python, Java 8, Aws... With The Mode Of Work Being Work From Office.',
      publishedDate: '29 Sep \'25',
      stageCount: 2,
      candidatesCount: 0,
      stageStatus: '',
      location: 'Pune',
      employmentType: 'Fullstack Engineer',
      experience: '2 - 4 years',
      salaryRange: '8 LPA - 9 LPA',
      status: 'Unpublished'
    },
    {
      id: 'fZogASXr',
      title: 'Python Fullstack Developer',
      description: 'You Are Hiring For A Python Fullstack Developer Role Requiring A Minimum Of 5 Years Of Experience. The Position Highlights Key Skills Such As Python, Django, Fastapi... With The Mode Of Work Being Work From Office.',
      publishedDate: '27 Sep \'25',
      stageCount: 1,
      candidatesCount: 117,
      stageStatus: 'Ongoing',
      location: 'Pune',
      employmentType: 'Fullstack Engineer',
      experience: '5 - 7 years',
      salaryRange: '18 LPA - 18 LPA',
      status: 'Published'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 text-white flex flex-col">
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-semibold">Spleen.ai</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveNav('create_job')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeNav === 'create_job' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>Create Job</span>
            </button>
            <button
              onClick={() => setActiveNav('view_opening')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeNav === 'view_opening' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span>View Opening</span>
            </button>
            <button
              onClick={() => setActiveNav('contact_us')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeNav === 'contact_us' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Mail className="w-5 h-5" />
              <span>Contact Us</span>
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">RO</span>
            </div>
            <span className="font-medium">Rohnit</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <Droplet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Fluid Live</h1>
          </div>

          {/* Job Openings List */}
          <div className="space-y-6">
            {jobOpenings.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Job Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h2>
                    <p className="text-sm text-gray-500">Job ID: {job.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    job.status === 'Published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {job.status}
                  </span>
                </div>

                {/* Job Description */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {job.description}
                </p>

                {/* Job Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>Published date: {job.publishedDate}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <BarChart className="w-4 h-4 text-blue-500" />
                    <span>Stage Count: {job.stageCount}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-600 font-medium">{job.candidatesCount} Candidates</span>
                  </div>
                  {job.stageStatus && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Loader2 className="w-4 h-4 text-blue-500" />
                      <span className="text-blue-600">Stage 1: {job.stageStatus}</span>
                    </div>
                  )}
                </div>

                {/* Job Tags */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.employmentType}</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>{job.experience}</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.salaryRange}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobOpeningsDashboard;