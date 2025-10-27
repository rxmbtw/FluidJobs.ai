import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, TrendingUp, Calendar, Plus, Eye } from 'lucide-react';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();

  const StatCard = ({ title, value, icon: Icon, onClick }: { title: string; value: number; icon: any; onClick: () => void }) => (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-center">
        <Icon className="w-8 h-8 text-blue-500 group-hover:text-blue-600 transition-colors" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
        <button 
          onClick={() => navigate('/post-project')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Post New Project</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Projects" value={5} icon={Briefcase} onClick={() => navigate('/projects')} />
        <StatCard title="Candidates Hired" value={12} icon={Users} onClick={() => navigate('/hired-candidates')} />
        <StatCard title="Project Views" value={89} icon={Eye} onClick={() => navigate('/project-analytics')} />
        <StatCard title="Interviews Scheduled" value={7} icon={Calendar} onClick={() => navigate('/interviews')} />
      </div>

      {/* Available Job Openings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Available Talent Pool</h2>
          <button 
            onClick={() => navigate('/careers')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
          >
            <span>View All Openings</span>
            <Eye className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Senior React Developer', available: 15, avgRate: '$85/hr', skills: ['React', 'Node.js', 'TypeScript'] },
            { title: 'Product Manager', available: 8, avgRate: '$95/hr', skills: ['Strategy', 'Analytics', 'Agile'] },
            { title: 'UX Designer', available: 12, avgRate: '$75/hr', skills: ['Figma', 'Research', 'Prototyping'] }
          ].map((role, index) => (
            <div 
              key={index}
              onClick={() => navigate('/browse-talent')}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">{role.title}</h3>
              <div className="space-y-2 mb-3">
                <p className="text-sm text-gray-600">{role.available} available</p>
                <p className="text-sm font-medium text-green-600">{role.avgRate}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {role.skills.map((skill, skillIndex) => (
                  <span key={skillIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>
              <button className="w-full mt-3 bg-blue-50 text-blue-600 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
                Browse Talent
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Projects */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Projects</h2>
          <div className="space-y-4">
            {[
              { title: 'E-commerce Platform', candidates: 8, status: 'Hiring' },
              { title: 'Mobile App Development', candidates: 5, status: 'In Progress' },
              { title: 'Data Analytics Dashboard', candidates: 12, status: 'Reviewing' }
            ].map((project, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-semibold text-gray-900">{project.title}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">{project.candidates} candidates applied</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'Hiring' ? 'bg-green-100 text-green-800' :
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Candidates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Candidates</h2>
          <div className="space-y-4">
            {[
              { name: 'Sarah Johnson', role: 'Full Stack Developer', rating: 4.9 },
              { name: 'Mike Chen', role: 'UI/UX Designer', rating: 4.8 },
              { name: 'Alex Rodriguez', role: 'Data Scientist', rating: 4.7 }
            ].map((candidate, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <div>
                  <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                  <p className="text-sm text-gray-600">{candidate.role}</p>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-gray-900">{candidate.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;