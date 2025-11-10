import React from 'react';
import FeatureCard from './FeatureCard';

const features = [
    { 
      title: "AI Match Score", 
      description: "Find roles that fit your skills with over 90% accuracy.",
      icon: <svg className="w-8 h-8 mb-4" style={{color: '#8B5CF6'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    },
    { 
      title: "AI Resume Builder", 
      description: "Create a perfect, keyword-optimized resume in seconds.",
      icon: <svg className="w-8 h-8 mb-4" style={{color: '#8B5CF6'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    },
    { 
      title: "AI Career Coach", 
      description: "Get personalized advice and answers to your career questions.",
      icon: <svg className="w-8 h-8 mb-4" style={{color: '#8B5CF6'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    },
    { 
      title: "Skill Analysis", 
      description: "Understand your strengths and what skills to learn next.",
      icon: <svg className="w-8 h-8 mb-4" style={{color: '#8B5CF6'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    },
    { 
      title: "Interview Prep", 
      description: "Practice with AI-generated questions specific to your target role.",
      icon: <svg className="w-8 h-8 mb-4" style={{color: '#8B5CF6'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
      </svg>
    },
    { 
      title: "Market Insights", 
      description: "See real-time salary data and market trends for your industry.",
      icon: <svg className="w-8 h-8 mb-4" style={{color: '#8B5CF6'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    }
];

const loopedFeatures = [...features, ...features];

const FeaturesSection: React.FC = () => {
  return (
    <div className="w-full py-24">
      <div className="mx-auto max-w-6xl text-center mb-16 px-4">
        <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
          More than a job board.
          <br/>
          An <span className="brand-gradient-text font-medium">AI Career Partner</span>.
        </h2>
      </div>
      
      <div className="feature-slider">
        <div className="slider-track">
          {loopedFeatures.map((feature, index) => (
            <FeatureCard key={index} title={feature.title} description={feature.description} icon={feature.icon} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
