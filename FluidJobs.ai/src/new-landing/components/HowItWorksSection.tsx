import React from 'react';

const steps = [
  { 
    title: "Build Your Profile", 
    description: "Upload your resume, connect your skills, and tell our AI what you truly want in a career.",
    icon: <svg className="w-8 h-8 mb-4" style={{color: '#8B5CF6'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A1.875 1.875 0 0 1 18.249 22.5H5.75a1.875 1.875 0 0 1-1.249-2.382Z" />
    </svg>
  },
  { 
    title: "Get AI-Powered Matches", 
    description: "Our engine analyzes millions of data points to find roles that \"actually\" fit your unique skill set.",
    icon: <svg className="w-8 h-8 mb-4" style={{color: '#8B5CF6'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  },
  { 
    title: "Connect & Get Hired", 
    description: "Connect directly with hiring managers for roles you're a 90%+ match for. No more black boxes.",
    icon: <svg className="w-8 h-8 mb-4" style={{color: '#8B5CF6'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 0 6.625l-3.328 3.328a4.5 4.5 0 0 1-6.625-6.625l3.328-3.328a4.5 4.5 0 0 1 6.625 0Zm-6.625 0a4.5 4.5 0 0 0 0 6.625l3.328 3.328a4.5 4.5 0 0 0 6.625-6.625l-3.328-3.328a4.5 4.5 0 0 0-6.625 0Z" />
    </svg>
  }
];

const HowItWorksSection: React.FC = () => {
  return (
    <div className="w-full py-24 px-4">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
          A Smarter Path to
          <br/>
          <span className="brand-gradient-text font-medium">Your Next Role</span>
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-16">
          Our AI-driven process is simple, transparent, and built for one thing:
          to find you the perfect fit, faster.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {steps.map((item, index) => (
            <div key={index} className="feature-card-new rounded-2xl p-6">
              <div className="lines-bg">
                <span className="line" style={{top: '20%'}}></span>
                <span className="line" style={{top: '30%'}}></span>
                <span className="line" style={{top: '70%'}}></span>
                <span className="line" style={{top: '80%'}}></span>
              </div>
              <div className="relative z-10 text-center">
                <div className="flex justify-center">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-300">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;
