import React, { useState } from 'react';
import { Clock, CheckSquare } from 'lucide-react';

interface AppliedJobsViewProps {
  themeState?: 'light' | 'dark';
}

const AppliedJobsView: React.FC<AppliedJobsViewProps> = ({ themeState = 'light' }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const cardBg = themeState === 'light' ? '#FFFFFF' : '#1F2937';
  const textPrimary = themeState === 'light' ? '#000000' : '#f9fafb';
  const textSecondary = themeState === 'light' ? '#6b7280' : '#9ca3af';
  const logoBg = themeState === 'light' ? '#D1D5DB' : '#374151';
  const borderColor = themeState === 'light' ? '#D1D5DB' : '#374151';

  return (
    <div className="p-6 lg:p-10 rounded-3xl shadow-2xl mx-auto max-w-5xl" style={{ backgroundColor: cardBg }}>
      {/* Company Banner and Logo */}
      <div className="relative mb-6">
        <div className="w-full h-40 rounded-xl" style={{ backgroundColor: logoBg }}></div>
        <div className="absolute -bottom-10 left-6 md:left-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg ring-8 ring-blue-500/20" style={{ backgroundColor: cardBg }}>
          <span className="text-4xl font-bold text-blue-500">FL</span>
        </div>
      </div>

      {/* Job Title, Post Date, and Status */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mt-10 md:mt-0 pt-4">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: textPrimary }}>QA Engineer - Insurance</h2>
          <p className="text-sm font-semibold" style={{ color: textSecondary }}>Posted on: 30/10/2025</p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="px-4 py-2 border rounded-lg flex items-center text-sm font-semibold" style={{ borderColor: borderColor, color: textPrimary }}>
            <Clock className="w-4 h-4 mr-1" />
            Under Review
          </div>
          <div className="px-4 py-2 bg-green-700/80 rounded-lg flex items-center text-sm font-semibold text-white">
            <CheckSquare className="w-4 h-4 mr-1" />
            Applied
          </div>
        </div>
      </div>

      {/* Job Metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 mb-6 mt-6" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <div>
          <p className="text-xs font-semibold uppercase mb-1" style={{ color: textSecondary }}>Job Type</p>
          <p className="text-sm font-semibold" style={{ color: textPrimary }}>Full-Time</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase mb-1" style={{ color: textSecondary }}>CTC</p>
          <p className="text-sm font-semibold" style={{ color: textPrimary }}>Rs.6.0L-Rs.15.0L</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase mb-1" style={{ color: textSecondary }}>Industry</p>
          <p className="text-sm font-semibold" style={{ color: textPrimary }}>Technology</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase mb-1" style={{ color: textSecondary }}>Location</p>
          <p className="text-sm font-semibold" style={{ color: textPrimary }}>Pune, Mumbai</p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h3 className="text-base font-semibold uppercase mb-3" style={{ color: textPrimary }}>Description</h3>
        {!showFullDescription ? (
          <div className="text-sm font-medium leading-relaxed" style={{ color: textSecondary }}>
            FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable,{' '}
            <span className="text-blue-500 cursor-pointer font-semibold" onClick={() => setShowFullDescription(true)}>
              more.
            </span>
          </div>
        ) : (
          <div className="text-sm font-medium leading-relaxed" style={{ color: textSecondary }}>
            FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable, more, FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable, FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable{' '}
            <span className="text-blue-500 cursor-pointer font-semibold" onClick={() => setShowFullDescription(false)}>
              less.
            </span>
          </div>
        )}
      </div>

      {/* Eligible Skills */}
      <div>
        <h3 className="text-base font-semibold uppercase mb-3" style={{ color: textPrimary }}>Eligible Skills</h3>
        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-1.5 border border-blue-500 rounded-lg text-sm font-medium text-blue-500 hover:bg-blue-50 transition duration-150">
            Python
          </div>
          <div className="px-4 py-1.5 border border-blue-500 rounded-lg text-sm font-medium text-blue-500 hover:bg-blue-50 transition duration-150">
            C/C++
          </div>
          <div className="px-4 py-1.5 border border-blue-500 rounded-lg text-sm font-medium text-blue-500 hover:bg-blue-50 transition duration-150">
            Java
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppliedJobsView;
