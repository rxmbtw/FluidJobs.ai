import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

interface RegistrationSuccessProps {
  onContinue: () => void;
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ onContinue }) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 z-50 flex items-center justify-center">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 360,
                x: Math.random() * window.innerWidth,
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                ease: "easeOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute text-yellow-400"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
                scale: 0,
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 180,
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                ease: "easeOut",
                delay: Math.random() * 1.5,
              }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 20,
          delay: 0.2 
        }}
        className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md mx-4 border border-green-200"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 15,
            delay: 0.5 
          }}
          className="mb-8"
        >
          <div className="relative mx-auto w-24 h-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-20"
            />
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto relative z-10" />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Congratulations!
          </h1>
          <p className="text-xl text-green-600 font-semibold mb-2">
            Registration Successful!
          </p>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your account has been created successfully. 
            <br />
            Please login with your credentials to continue.
          </p>
        </motion.div>

        {/* Animated Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onContinue}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-semibold shadow-lg flex items-center mx-auto transition-all duration-200"
        >
          Continue to Login
          <ArrowRight className="ml-2 w-5 h-5" />
        </motion.button>

        {/* Floating Elements */}
        <div className="absolute -top-4 -left-4 text-yellow-400 opacity-70">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>
        </div>
        
        <div className="absolute -top-2 -right-6 text-pink-400 opacity-70">
          <motion.div
            animate={{ 
              rotate: [0, -15, 15, 0],
              y: [0, -5, 0]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </div>

        <div className="absolute -bottom-3 -left-2 text-blue-400 opacity-70">
          <motion.div
            animate={{ 
              rotate: [0, 20, -20, 0],
              scale: [1, 0.9, 1.1, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationSuccess;