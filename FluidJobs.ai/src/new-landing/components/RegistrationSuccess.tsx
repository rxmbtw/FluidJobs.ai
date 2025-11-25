import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface RegistrationSuccessProps {
  onNavigateToLogin: () => void;
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ onNavigateToLogin }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
  }, []);

  return (
    <div className="antialiased relative" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(199, 220, 255, 1) 100%)', minHeight: '100vh' }}>
      <div id="background-visuals" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(199, 220, 255, 1) 100%)' }}>
        <div className="background-grid"></div>
        <div className="hero-launch-glow"></div>
        <div className="footer-glow"></div>
      </div>
      
      <div className="flex min-h-screen w-full relative justify-center items-center p-4" style={{ zIndex: 10 }}>
        <div 
          className={`bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-lg w-full text-center transition-all duration-700 ${showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
        >
          {/* Party Popper Animation */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-confetti"
                  style={{
                    backgroundColor: ['#4285F4', '#34A853', '#FBBC04', '#EA4335'][i % 4],
                    animationDelay: `${i * 0.1}s`,
                    transform: `rotate(${i * 30}deg) translateY(-100px)`,
                    opacity: 0
                  }}
                />
              ))}
            </div>
            
            {/* Success Icon */}
            <div className="relative inline-block">
              <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-bounce-slow">
                <CheckCircle className="w-16 h-16 text-green-500" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'rgba(66, 133, 244, 1)' }}>
            Profile Created Successfully! 🎉
          </h1>
          
          <p className="text-lg mb-2" style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
            Welcome to FluidJobs.ai
          </p>
          
          <p className="text-sm mb-8" style={{ color: 'rgba(96, 96, 96, 1)' }}>
            Your account has been created successfully. You can now login and start exploring amazing job opportunities!
          </p>
          
          <button 
            onClick={onNavigateToLogin}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl"
            style={{ backgroundColor: 'rgba(66, 133, 244, 1)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 133, 244, 0.9)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 133, 244, 1)'}
          >
            Go to Login
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: rotate(var(--rotation)) translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--rotation)) translateY(200px) scale(0.5);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti 2s ease-out forwards;
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default RegistrationSuccess;
