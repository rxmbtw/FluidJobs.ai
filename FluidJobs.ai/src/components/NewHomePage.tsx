import React from 'react';
import { 
  Home, 
  Users, 
  Briefcase, 
  FileText, 
  Phone, 
  Settings, 
  User,
  Plus,
  CheckSquare,
  Bookmark
} from 'lucide-react';

const NewHomePage: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full h-25 bg-white border-b border-black border-opacity-20 flex items-center justify-between px-5">
        {/* Logo Section */}
        <div className="flex items-center">
          <div className="w-15 h-15 mr-5">
            <img src="/images/FLuid Live Icon.png" alt="FluidJobs Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold" style={{
            background: 'linear-gradient(90deg, #4285F4 0%, #0060FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            FluidJobs.ai
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center">
          {/* Bookmark Icon */}
          <div className="w-9 h-9 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
            <Bookmark className="w-4 h-4 text-gray-600" />
          </div>
          
          {/* Generate Resume Button */}
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold text-sm flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Generate Resume
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="absolute left-0 top-25 w-26 h-full bg-white border-r border-black border-opacity-20">
        <div className="flex flex-col items-center py-5">
          {/* Home Icon - Active */}
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Home className="w-5 h-5 text-blue-500" />
          </div>

          {/* Navigation Icons */}
          <div className="space-y-4">
            <div className="w-6 h-6 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-800" />
            </div>
            <div className="w-6 h-6 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-gray-800" />
            </div>
            <div className="w-6 h-6 flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-800" />
            </div>
            <div className="w-6 h-6 flex items-center justify-center">
              <Phone className="w-5 h-5 text-gray-800" />
            </div>
          </div>

          {/* Divider */}
          <div className="w-11 h-px bg-black bg-opacity-30 my-8"></div>

          {/* Settings */}
          <div className="w-6 h-6 flex items-center justify-center mb-auto">
            <Settings className="w-5 h-5 text-gray-800" />
          </div>

          {/* Profile - Bottom */}
          <div className="mt-auto mb-5">
            <div className="w-19 h-19 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="absolute left-26 top-25 right-0 bottom-0 p-8">
        {/* Announcements Section */}
        <div className="absolute left-8 top-8">
          <h2 className="text-2xl font-bold text-black mb-6">Announcements</h2>
        </div>

        {/* Announcements Card */}
        <div className="absolute left-8 top-20 w-190 h-155 bg-white rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-sm font-semibold leading-5">
              Complete your profile to start getting<br />
              announcements of the latest job openings!
            </p>
          </div>
        </div>

        {/* Complete Profile Card */}
        <div className="absolute right-8 top-8 w-83 h-99 bg-white rounded-lg p-6">
          <h3 className="text-2xl font-bold text-black mb-4">Complete your profile</h3>
          
          <p className="text-gray-500 text-sm font-semibold mb-6 leading-5">
            By completing your profile you can start<br />
            applying to job openings in one click...
          </p>

          {/* Progress Section */}
          <div className="mb-8">
            <p className="text-lg font-semibold text-black mb-2">50%</p>
            <div className="w-full bg-gray-300 h-1.5 mb-4">
              <div className="bg-blue-500 h-1.5 w-1/2"></div>
            </div>
            <div className="w-full h-px bg-black bg-opacity-30"></div>
          </div>

          {/* Profile Tasks */}
          <div className="space-y-4">
            {/* Upload Resume */}
            <div className="border border-black border-opacity-20 rounded-lg p-3 flex items-center justify-between">
              <span className="text-gray-500 text-sm font-semibold">Upload resume</span>
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-5 h-5 text-gray-400" />
                <Plus className="w-5 h-5 text-blue-500" />
              </div>
            </div>

            {/* Upload Profile Picture */}
            <div className="border border-black border-opacity-20 rounded-lg p-3 flex items-center justify-between">
              <span className="text-gray-500 text-sm font-semibold">Upload profile picture</span>
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-5 h-5 text-gray-400" />
                <Plus className="w-5 h-5 text-blue-500" />
              </div>
            </div>

            {/* Add Address */}
            <div className="border border-black border-opacity-20 rounded-lg p-3 flex items-center justify-between">
              <span className="text-gray-500 text-sm font-semibold">Add your address</span>
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-5 h-5 text-gray-400" />
                <Plus className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHomePage;