import React from 'react';
import { FileText, Sparkles, Mail, Phone, Calendar, MapPin, Info } from 'lucide-react';

interface MyResumeViewProps {
  themeState?: 'light' | 'dark';
}

const MyResumeView: React.FC<MyResumeViewProps> = ({ themeState = 'light' }) => {
  const cardBg = themeState === 'light' ? '#FFFFFF' : '#1F2937';
  const textPrimary = themeState === 'light' ? '#000000' : '#f9fafb';
  const textSecondary = themeState === 'light' ? '#6b7280' : '#9ca3af';
  const borderColor = themeState === 'light' ? '#D1D5DB' : '#374151';
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-4">
      <h1 className="text-xl sm:text-3xl font-bold mb-6 hidden lg:block" style={{ color: textPrimary }}>My Resume</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN - Profile and Information */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <div className="p-4 pt-16 rounded-3xl shadow-lg relative overflow-hidden" style={{ backgroundColor: cardBg }}>
            <div className="absolute top-0 left-0 w-full h-32 rounded-t-2xl bg-gradient-to-r from-[#0060FF] to-[#4285F4]"></div>

            <div className="relative z-10 mx-auto w-24 h-24 rounded-full p-1" style={{ backgroundColor: cardBg }}>
              <div className="w-full h-full bg-[#4285F4] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                SS
              </div>
            </div>

            <div className="text-center mt-3">
              <h2 className="text-xl font-bold" style={{ color: textPrimary }}>Shriram Surse</h2>
              <p className="text-sm text-[#4285F4] mt-1">Pune, Maharashtra | Joined Oct 2025</p>
            </div>

            <div className="flex space-x-4 mt-6 justify-center pb-4">
              <button className="flex items-center space-x-2 bg-[#4285F4] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:bg-blue-600 transition">
                <FileText className="w-4 h-4" />
                <span>Generate Resume</span>
              </button>
              <button className="flex items-center space-x-2 bg-green-700/70 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:bg-green-800 transition">
                <Sparkles className="w-4 h-4" />
                <span>AI Resume Reviewer</span>
              </button>
            </div>
          </div>

          {/* Information Card */}
          <div className="p-6 rounded-3xl shadow-lg" style={{ backgroundColor: cardBg }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: textPrimary }}>Information</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3" style={{ color: textSecondary }}>
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">Email Address</span>
                </div>
                <span className="text-sm font-medium" style={{ color: textPrimary }}>ram@fluid.live</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3" style={{ color: textSecondary }}>
                  <Phone className="w-5 h-5" />
                  <span className="text-sm">Phone Number</span>
                </div>
                <span className="text-sm font-medium" style={{ color: textPrimary }}>+91 98765 XXXXX</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3" style={{ color: textSecondary }}>
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">DOB (Date of Birth)</span>
                </div>
                <span className="text-sm font-medium" style={{ color: textPrimary }}>01/01/2004</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3" style={{ color: textSecondary }}>
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm">Current City</span>
                </div>
                <span className="text-sm font-medium" style={{ color: textPrimary }}>Pune, Maharashtra</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3" style={{ color: textSecondary }}>
                  <Info className="w-5 h-5" />
                  <span className="text-sm">Joined</span>
                </div>
                <span className="text-sm font-medium" style={{ color: textPrimary }}>5 Oct 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Work Experience and Skills */}
        <div className="lg:col-span-8 space-y-6">
          {/* Work Experience Card */}
          <div className="p-6 rounded-3xl shadow-lg min-h-[312px]" style={{ backgroundColor: cardBg }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: textPrimary }}>Work Experience</h3>

            <div className="border-l-4 border-[#4285F4] pl-4 space-y-1">
              <div className="flex justify-between items-start">
                <h4 className="text-base font-semibold" style={{ color: textPrimary }}>Software Development Engineer Intern</h4>
                <span className="text-sm font-medium text-right" style={{ color: textPrimary }}>Aug 2025 - Present</span>
              </div>
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium" style={{ color: textSecondary }}>FluidLive Solutions Pvt Ltd</p>
                <span className="text-xs font-medium text-right hidden sm:block" style={{ color: textSecondary }}>Current CTC: 3LPA</span>
              </div>
              <p className="text-xs font-medium text-[#4285F4] mt-0.5">Pune, Maharashtra</p>
            </div>
          </div>

          {/* Skills and Education Card */}
          <div className="p-6 rounded-3xl shadow-lg min-h-[288px]" style={{ backgroundColor: cardBg }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: textPrimary }}>Skills</h3>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-1 border border-[#4285F4] text-[#4285F4] font-medium rounded-md text-sm transition hover:bg-blue-50">Python</span>
              <span className="px-4 py-1 border border-[#4285F4] text-[#4285F4] font-medium rounded-md text-sm transition hover:bg-blue-50">C/C++</span>
              <span className="px-4 py-1 border border-[#4285F4] text-[#4285F4] font-medium rounded-md text-sm transition hover:bg-blue-50">Java</span>
              <span className="px-4 py-1 border border-[#4285F4] text-[#4285F4] font-medium rounded-md text-sm transition hover:bg-blue-50">Tailwind CSS</span>
              <span className="px-4 py-1 border border-[#4285F4] text-[#4285F4] font-medium rounded-md text-sm transition hover:bg-blue-50">React</span>
              <span className="px-4 py-1 border border-[#4285F4] text-[#4285F4] font-medium rounded-md text-sm transition hover:bg-blue-50">Firestore</span>
              <span className="px-4 py-1 border border-[#4285F4] text-[#4285F4] font-medium rounded-md text-sm transition hover:bg-blue-50">Cloud Functions</span>
            </div>

            <hr className="my-6" style={{ borderColor: borderColor }} />

            <h3 className="text-xl font-bold mb-4" style={{ color: textPrimary }}>Education</h3>

            <div className="border-l-4 pl-4 space-y-1" style={{ borderColor: borderColor }}>
              <div className="flex justify-between items-start">
                <h4 className="text-base font-semibold" style={{ color: textPrimary }}>B.Tech in Computer Science</h4>
                <span className="text-sm font-medium text-right" style={{ color: textPrimary }}>2021 - 2025</span>
              </div>
              <p className="text-sm font-medium" style={{ color: textSecondary }}>Pune Institute of Technology</p>
              <p className="text-xs font-medium text-[#4285F4] mt-0.5">Pune, Maharashtra | CGPA: 9.2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyResumeView;
