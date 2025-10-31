import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Users, Briefcase, TrendingUp, Menu, X, 
  FilePlus2, BrainCircuit, UserCheck, Star, CheckCircle,
  Shield, Zap, Globe, Quote, Sparkles, Play, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import FAQSection from './FAQSection';

const PremiumLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated Lines Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation state
    let animationId: number;
    let mouseX = 0, mouseY = 0;
    let attractionPoint: { x: number; y: number; active: boolean } = { x: 0, y: 0, active: false };
    
    const lines: Array<{
      x1: number; y1: number; x2: number; y2: number;
      progress: number; speed: number; opacity: number;
      originalX1: number; originalY1: number; originalX2: number; originalY2: number;
    }> = [];

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Button click attraction
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const rect = (target.closest('button') || target).getBoundingClientRect();
        attractionPoint = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          active: true
        };
        setTimeout(() => { attractionPoint.active = false; }, 2000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleButtonClick);

    // Generate web structure lines
    const generateLines = () => {
      lines.length = 0;
      const centerY = canvas.height / 2;
      const leftX = canvas.width * 0.05;
      const rightX = canvas.width * 0.95;
      
      // Main horizontal backbone lines
      for (let i = 0; i < 4; i++) {
        const y = centerY - 150 + (i * 100);
        lines.push({
          x1: leftX, y1: y, x2: rightX, y2: y,
          originalX1: leftX, originalY1: y, originalX2: rightX, originalY2: y,
          progress: Math.random() * -1,
          speed: 0.004 + Math.random() * 0.003,
          opacity: 0.3 + Math.random() * 0.2
        });
      }
      
      // Connecting vertical lines
      for (let i = 0; i < 8; i++) {
        const x = leftX + (i * (rightX - leftX) / 7);
        const y1 = centerY - 150;
        const y2 = centerY + 150;
        lines.push({
          x1: x, y1: y1, x2: x, y2: y2,
          originalX1: x, originalY1: y1, originalX2: x, originalY2: y2,
          progress: Math.random() * -1,
          speed: 0.002 + Math.random() * 0.002,
          opacity: 0.15 + Math.random() * 0.1
        });
      }
      
      // Diagonal connecting lines
      for (let i = 0; i < 6; i++) {
        const x1 = leftX + Math.random() * (rightX - leftX) * 0.3;
        const y1 = centerY - 100 + Math.random() * 200;
        const x2 = rightX - Math.random() * (rightX - leftX) * 0.3;
        const y2 = centerY - 100 + Math.random() * 200;
        
        lines.push({
          x1, y1, x2, y2,
          originalX1: x1, originalY1: y1, originalX2: x2, originalY2: y2,
          progress: Math.random() * -1,
          speed: 0.003 + Math.random() * 0.002,
          opacity: 0.1 + Math.random() * 0.15
        });
      }
    };

    generateLines();
    
    // Regenerate lines on resize
    const handleResize = () => {
      resizeCanvas();
      generateLines();
    };
    
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      lines.forEach(line => {
        // Subtle cursor interaction
        const mouseInfluence = 0.008;
        const distToMouse = Math.sqrt((mouseX - (line.x1 + line.x2)/2) ** 2 + (mouseY - (line.y1 + line.y2)/2) ** 2);
        
        if (distToMouse < 120) {
          const pullX = (mouseX - (line.x1 + line.x2)/2) * mouseInfluence;
          const pullY = (mouseY - (line.y1 + line.y2)/2) * mouseInfluence;
          line.x1 += pullX * 0.3;
          line.y1 += pullY * 0.3;
          line.x2 += pullX * 0.3;
          line.y2 += pullY * 0.3;
        } else {
          line.x1 += (line.originalX1 - line.x1) * 0.02;
          line.y1 += (line.originalY1 - line.y1) * 0.02;
          line.x2 += (line.originalX2 - line.x2) * 0.02;
          line.y2 += (line.originalY2 - line.y2) * 0.02;
        }
        
        // Button attraction
        if (attractionPoint.active) {
          const attractionStrength = 0.03;
          const midX = (line.x1 + line.x2) / 2;
          const midY = (line.y1 + line.y2) / 2;
          const pullX = (attractionPoint.x - midX) * attractionStrength;
          const pullY = (attractionPoint.y - midY) * attractionStrength;
          
          line.x1 += pullX;
          line.y1 += pullY;
          line.x2 += pullX;
          line.y2 += pullY;
        }
        
        // Update progress
        line.progress += line.speed;
        if (line.progress > 1.5) {
          line.progress = -0.5;
        }
        
        // Draw base line structure
        ctx.strokeStyle = `rgba(147, 197, 253, ${line.opacity * 0.3})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
        
        // Draw flowing energy
        if (line.progress >= 0 && line.progress <= 1) {
          const gradient = ctx.createLinearGradient(line.x1, line.y1, line.x2, line.y2);
          const flowPos = line.progress;
          
          gradient.addColorStop(0, `rgba(59, 130, 246, 0)`);
          gradient.addColorStop(Math.max(0, flowPos - 0.1), `rgba(59, 130, 246, 0)`);
          gradient.addColorStop(flowPos, `rgba(59, 130, 246, ${line.opacity})`);
          gradient.addColorStop(Math.min(1, flowPos + 0.1), `rgba(59, 130, 246, 0)`);
          gradient.addColorStop(1, `rgba(59, 130, 246, 0)`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 3;
          
          ctx.beginPath();
          ctx.moveTo(line.x1, line.y1);
          ctx.lineTo(line.x2, line.y2);
          ctx.stroke();
          
          // Glowing dot
          const dotX = line.x1 + (line.x2 - line.x1) * flowPos;
          const dotY = line.y1 + (line.y2 - line.y1) * flowPos;
          
          ctx.fillStyle = `rgba(59, 130, 246, ${line.opacity * 1.5})`;
          ctx.shadowColor = 'rgba(59, 130, 246, 0.8)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleButtonClick);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Removed automatic redirect to dashboard - landing page always shows

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const wordAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  // Desktop Mockup Component
  const DesktopMockup = () => (
    <div className="hidden xl:block absolute right-16 top-1/2 transform translate-y-8 z-5">
      <div className="relative">
        {/* Desktop Monitor */}
        <div className="w-64 h-40 bg-gray-900 rounded-lg p-1 shadow-2xl">
          {/* Screen Bezel */}
          <div className="w-full h-full bg-black rounded-md overflow-hidden relative">
            {/* Screen Content - Landing Page Screenshot */}
            <div className="w-full h-full bg-gradient-to-br from-purple-900 via-gray-900 to-black relative">
              {/* Simulated Landing Page Content */}
              <div className="absolute top-2 left-2 right-2">
                <div className="h-1 bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded mb-2 opacity-60"></div>
                <div className="space-y-1">
                  <div className="h-1 bg-gray-600 rounded w-3/4"></div>
                  <div className="h-1 bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex space-x-1">
                  <div className="h-4 w-12 bg-blue-500 rounded opacity-40"></div>
                  <div className="h-4 w-12 bg-gray-600 rounded opacity-40"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Monitor Stand */}
        <div className="w-12 h-6 bg-gray-800 mx-auto mt-1 rounded-b-md"></div>
        <div className="w-20 h-1 bg-gray-700 mx-auto mt-1 rounded-full"></div>
      </div>
    </div>
  );

  // Cursor tracking for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.body.style.setProperty('--cursor-x', e.clientX + 'px');
      document.body.style.setProperty('--cursor-y', e.clientY + 'px');
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Scroll flash effect
  useEffect(() => {
    const flashTextElements = document.querySelectorAll('.scroll-flash-text');
    let scrollTimeout: NodeJS.Timeout;
    let isScrolling = false;

    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        flashTextElements.forEach(element => {
          element.classList.add('is-flashing');
        });
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        flashTextElements.forEach(element => {
          element.classList.remove('is-flashing');
        });
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Spotlight reflection effect
  useEffect(() => {
    const wrappers = document.querySelectorAll('.reflection-wrapper');
    
    const handleScrollAnimation = () => {
      wrappers.forEach(wrapper => {
        const topText = wrapper.querySelector('.reflection-text-top') as HTMLElement;
        if (!topText) return;
        
        const rect = wrapper.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        const clampedProgress = Math.max(0, Math.min(1, progress));
        
        const maskX = -25 + (clampedProgress * 150);
        topText.style.maskPosition = `${maskX}% 50%`;
        topText.style.webkitMaskPosition = `${maskX}% 50%`;
      });
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', handleScrollAnimation, { passive: true });
          handleScrollAnimation();
        }
      });
    });

    wrappers.forEach(wrapper => observer.observe(wrapper));

    return () => {
      wrappers.forEach(wrapper => observer.unobserve(wrapper));
      window.removeEventListener('scroll', handleScrollAnimation);
    };
  }, []);

  // Inject global styles
  useEffect(() => {
    const globalStyles = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
      
      :root {
        --color-background-light: #F9FAFB;
        --color-text-dark: #111827;
        --color-text-subtle: #4B5563;
        --color-accent-green: #00F078;
        --color-accent-blue-soft: #4A70FF;
        --color-border-light-subtle: rgba(0, 0, 0, 0.08);
        --color-card-background: rgba(255, 255, 255, 0.8);
        --color-navbar-background: rgba(255, 255, 255, 0.8);
        --text-default-color: #111827;
        --text-glow-gradient: linear-gradient(45deg, #3B82F6, #6D28D9, #9333EA, #4A00B3);
        --text-glow-shadow: 0 0 8px rgba(59, 130, 246, 0.5), 0 0 15px rgba(109, 40, 217, 0.3);
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', sans-serif !important;
        background-color: #F9FAFB !important;
        color: #111827 !important;
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        line-height: 1.6;
        position: relative;
      }
      
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: 
          radial-gradient(circle 600px at var(--cursor-x, 50%) var(--cursor-y, 50%), rgba(59, 130, 246, 0.15), transparent 70%),
          radial-gradient(circle 800px at 20% 20%, rgba(255, 209, 220, 0.6), transparent 50%),
          radial-gradient(circle 900px at 80% 10%, rgba(209, 216, 255, 0.6), transparent 50%);
        z-index: 0;
        pointer-events: none;
      }
      
      .gradient-section {
        position: relative;
        z-index: 1;
      }
      
      .gradient-section > * {
        position: relative;
        z-index: 2;
      }
      
      .white-section {
        background-color: #ffffff;
        position: relative;
        z-index: 1;
      }
      
      .feature-card {
        background: linear-gradient(145deg, #7A9BFF 0%, #615EFF 100%) !important;
        border: none !important;
        border-radius: 24px !important;
        box-shadow: 0 10px 30px rgba(97, 94, 255, 0.4), 0 0 20px rgba(122, 155, 255, 0.3) inset !important;
        padding: 32px !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        min-height: 400px !important;
        overflow: hidden !important;
        position: relative !important;
        transition: transform 0.3s ease, box-shadow 0.3s ease !important;
        z-index: 10 !important;
        width: 100% !important;
      }
      
      .feature-card:hover {
        transform: translateY(-10px) scale(1.02) !important;
        box-shadow: 0 20px 40px rgba(97, 94, 255, 0.5), 0 0 30px rgba(122, 155, 255, 0.4) inset !important;
      }
      
      .feature-card-content {
        z-index: 2;
        position: relative;
      }
      
      .feature-card-title {
        font-size: 24px !important;
        font-weight: 700 !important;
        color: #FFFFFF !important;
        margin-bottom: 12px !important;
        text-align: left !important;
      }
      
      .feature-card-description {
        font-size: 16px !important;
        font-weight: 400 !important;
        color: rgba(255, 255, 255, 0.9) !important;
        line-height: 1.6 !important;
        text-align: left !important;
      }
      
      .feature-card-graphic {
        position: absolute !important;
        bottom: -20px !important;
        right: -30px !important;
        width: 150px !important;
        height: 150px !important;
        pointer-events: none !important;
        opacity: 0.7 !important;
        z-index: 1 !important;
      }
      
      .feature-card-graphic > div {
        width: 100% !important;
        height: 100% !important;
        background: rgba(255, 255, 255, 0.2) !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      .feature-card-graphic > div > div {
        width: 60% !important;
        height: 60% !important;
        background: rgba(255, 255, 255, 0.3) !important;
        border-radius: 12px !important;
      }
      
      .scroll-flash-text {
        color: #111827;
        transition: all 0.3s ease-out;
        will-change: color, background;
        display: inline-block;
      }
      
      .scroll-flash-text.is-flashing {
        background: linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #3B82F6);
        background-size: 200% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        color: transparent;
        animation: flashGradient 0.8s ease-in-out;
      }
      
      @keyframes flashGradient {
        0% {
          background-position: 200% 0;
        }
        50% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      
      .reflection-wrapper {
        position: relative;
        display: inline;
      }
      
      .reflection-text-base {
        color: #111827;
        visibility: visible;
      }
      
      .reflection-text-top {
        position: absolute;
        top: 0;
        left: 0;
        color: transparent;
        background: linear-gradient(45deg, #A8BFFF, #FFFFFF, #D7BFFF);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        -webkit-mask-image: radial-gradient(circle 120px at 50% 50%, black 40%, transparent 100%);
        mask-image: radial-gradient(circle 120px at 50% 50%, black 40%, transparent 100%);
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        -webkit-mask-position: -100% 50%;
        mask-position: -100% 50%;
        pointer-events: none;
      }
      

      
      .text-heading-hero {
        font-size: clamp(48px, 6vw, 72px);
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: -0.04em;
        color: #111827;
      }
      
      .text-heading-section {
        font-size: clamp(36px, 4vw, 48px);
        font-weight: 700;
        line-height: 1.2;
        color: #111827;
      }
      
      .text-body-large {
        font-size: 18px;
        font-weight: 400;
        line-height: 1.7;
        color: #4B5563;
      }
      
      .text-body-normal {
        font-size: 16px;
        font-weight: 400;
        line-height: 1.6;
        color: #4B5563;
      }
      
      .text-label-small {
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #4B5563;
      }
      
      .navbar-container {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
        backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 50px;
        padding: 12px 24px;
        display: flex;
        align-items: center;
        gap: 24px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }
      
      .navbar-logo {
        height: 32px;
        color: #111827;
        margin-right: 32px;
      }
      
      .navbar-links a {
        color: #4B5563;
        text-decoration: none;
        font-weight: 500;
        font-size: 15px;
        padding: 8px 16px;
        border-radius: 8px;
        transition: all 0.2s ease;
      }
      
      .navbar-links a:hover {
        color: #111827;
        background-color: rgba(0, 0, 0, 0.08);
      }
      
      .navbar-button-login {
        background-color: transparent;
        color: var(--color-text-subtle);
        border: none;
        padding: 10px 20px;
        font-size: 15px;
        font-weight: 500;
        border-radius: 100px;
        transition: all 0.2s ease;
      }
      
      .navbar-button-login:hover {
        color: var(--color-text-light);
        background-color: rgba(255, 255, 255, 0.08);
      }
      
      .navbar-button-get-started {
        background-color: var(--color-accent-blue-soft);
        color: #FFFFFF;
        border: none;
        padding: 10px 20px;
        font-size: 15px;
        font-weight: 500;
        border-radius: 100px;
        margin-left: 16px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(62, 102, 242, 0.3);
      }
      
      .navbar-button-get-started:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(62, 102, 242, 0.4);
        filter: brightness(1.1);
      }
      
      .hero-section {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        min-height: calc(100vh - 100px);
        padding: 120px 0 80px 0;
        position: relative;
        z-index: 1;
      }
      
      .hero-headline {
        max-width: 800px;
        margin-bottom: 24px;
      }
      
      .hero-subheadline {
        max-width: 600px;
        margin-bottom: 48px;
      }
      
      .gradient-text {
        background: linear-gradient(90deg, #6D28D9, #3B82F6);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        color: transparent;
      }
      
      @keyframes subtleGradientShift {
        0% {
          background-position: 0% 50%;
        }
        100% {
          background-position: 100% 50%;
        }
      }
      
      .trusted-by-section {
        margin-top: 80px;
        padding-top: 40px;
        border-top: 1px solid var(--color-border-dark-subtle);
        overflow: hidden;
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .logo-carousel {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        margin-top: 40px;
        position: relative;
      }
      
      .logo-track {
        display: flex;
        flex-shrink: 0;
        animation: scrollLogos 30s linear infinite;
      }
      
      .logo-track span {
        margin: 0 40px;
        filter: grayscale(100%) brightness(150%) opacity(0.5);
        transition: filter 0.3s ease;
        font-size: 1.5rem;
        font-weight: bold;
        color: #9CA3AF;
        white-space: nowrap;
      }
      
      .logo-track span:hover {
        filter: grayscale(0%) brightness(100%) opacity(1);
      }
      
      @keyframes scrollLogos {
        from {
          transform: translateX(0%);
        }
        to {
          transform: translateX(-100%);
        }
      }
      
      @keyframes scrollLogos {
        from {
          transform: translateX(0%);
        }
        to {
          transform: translateX(-100%);
        }
      }
      

    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = globalStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ backgroundColor: 'transparent' }}>
      {/* Glass-Like Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-6 w-full z-50 flex justify-center"
      >
        <div className="navbar-container">
          <div className="flex items-center gap-6">
            {/* FluidJobs.ai Logo */}
            <motion.div 
              className="navbar-logo flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src="/images/FLuid Live Icon.png" 
                alt="FluidJobs.ai Logo" 
                className="w-8 h-8 object-contain"
                style={{ background: 'transparent', mixBlendMode: 'multiply' }}
              />
              <span className="font-bold text-xl">
                FluidJobs.ai
              </span>
            </motion.div>
            
            {/* Navigation Links */}
            <div className="navbar-links hidden md:flex items-center space-x-6">
              <a href="#features">Features</a>
              <a href="#testimonials">Testimonials</a>
              <a href="#pricing">Pricing</a>
              <button onClick={() => navigate('/careers')}>Careers</button>
              <button onClick={() => navigate('/login')}>Login</button>
            </div>
            
            {/* Get Started Button */}
            <button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Modern Hero Section */}
      <section 
        className="hero-section gradient-section relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center"
      >

        


        <div className="relative max-w-7xl mx-auto text-center z-10">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div className="mb-8">
              <motion.h1
                variants={wordAnimation}
                className="text-heading-hero"
              >
                Transform Your Hiring Process
              </motion.h1>
            </motion.div>
            
            <motion.p 
              variants={fadeInUp}
              className="text-body-large mb-12 max-w-4xl mx-auto"
            >
              Experience the future of recruitment with our AI-powered platform that transforms how you discover, evaluate, and hire exceptional talent.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="hero-cta-group flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              <motion.button 
                whileHover={{ 
                  y: -3,
                  boxShadow: "0 12px 30px rgba(109, 40, 217, 0.4)",
                  filter: "brightness(1.1)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="btn-start-trial bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold flex items-center group transition-all duration-300"
                style={{ boxShadow: "0 8px 25px rgba(109, 40, 217, 0.3)" }}
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button 
                whileHover={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }}
                className="btn-watch-demo bg-transparent text-white border px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 flex items-center group"
                style={{ 
                  borderColor: 'var(--color-border-dark-subtle)',
                  color: 'var(--color-text-light)'
                }}
              >
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </motion.button>
            </motion.div>
            
            {/* Social Proof Section */}
            <motion.div 
              variants={fadeInUp}
              className="text-center"
            >
              <p className="text-label-small mb-8">
                TRUSTED BY LEADING HIRING TEAMS AT
              </p>
              <div className="flex justify-center items-center space-x-12 flex-wrap gap-8 opacity-60">
                {["Microsoft", "Google", "Amazon", "Meta", "Apple"].map((company, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="text-2xl font-bold text-gray-400 filter grayscale"
                  >
                    {company}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section id="features" className="py-24 relative white-section">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-heading font-bold text-gray-900 mb-6">
              Everything you need to hire better
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful AI-driven features designed to revolutionize your hiring workflow
            </p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { 
                title: 'AI-Powered Matching', 
                desc: 'Our advanced AI analyzes thousands of data points to find the perfect candidates for your roles in seconds',
                image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=300&fit=crop&auto=format'
              },
              { 
                title: 'Smart Job Management', 
                desc: 'Create, publish, and manage job postings across 50+ platforms with intelligent optimization',
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=300&fit=crop&auto=format'
              },
              { 
                title: 'Predictive Analytics', 
                desc: 'Get actionable insights with predictive analytics that forecast hiring success and candidate performance',
                image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=300&h=300&fit=crop&auto=format'
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="feature-card"
                style={{
                  background: 'linear-gradient(145deg, #A5B4FC 0%, #8B5CF6 100%)',
                  border: 'none',
                  borderRadius: '24px',
                  boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3), 0 0 20px rgba(165, 180, 252, 0.2) inset',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '400px',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  zIndex: 10
                }}
              >
                <div className="feature-card-content">
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#FFFFFF',
                    marginBottom: '12px',
                    textAlign: 'left'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: '1.6',
                    textAlign: 'left'
                  }}>
                    {feature.desc}
                  </p>
                </div>
                
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  right: '-30px',
                  width: '150px',
                  height: '150px',
                  pointerEvents: 'none',
                  opacity: '0.8',
                  zIndex: 1
                }}>
                  <img 
                    src={feature.image}
                    alt={feature.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      filter: 'brightness(1.2) contrast(0.8)'
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Job Openings Section */}
      <section className="py-24 gradient-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6">
              Join Our Amazing Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover exciting career opportunities and be part of our mission to transform recruitment
            </p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {[
              { 
                title: 'Senior React Developer', 
                department: 'Engineering', 
                location: 'San Francisco, CA',
                type: 'Full-time',
                gradient: 'from-blue-500 to-indigo-500',
                image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop'
              },
              { 
                title: 'Product Manager', 
                department: 'Product', 
                location: 'New York, NY',
                type: 'Full-time',
                gradient: 'from-purple-500 to-pink-500',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop'
              },
              { 
                title: 'UX Designer', 
                department: 'Design', 
                location: 'Remote',
                type: 'Full-time',
                gradient: 'from-green-500 to-teal-500',
                image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop'
              },
              { 
                title: 'Data Scientist', 
                department: 'Analytics', 
                location: 'Austin, TX',
                type: 'Full-time',
                gradient: 'from-orange-500 to-red-500',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop'
              },
              { 
                title: 'DevOps Engineer', 
                department: 'Infrastructure', 
                location: 'Seattle, WA',
                type: 'Full-time',
                gradient: 'from-cyan-500 to-blue-500',
                image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop'
              },
              { 
                title: 'Sales Manager', 
                department: 'Sales', 
                location: 'Chicago, IL',
                type: 'Full-time',
                gradient: 'from-indigo-500 to-purple-500',
                image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=250&fit=crop'
              }
            ].map((job, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ 
                  y: -8, 
                  transition: { duration: 0.3 }
                }}
                onClick={() => {
                  // Create a job ID from the title for demo purposes
                  const jobId = job.title === 'Senior React Developer' ? 'SENIOR_REACT_DEV' : 
                               job.title === 'Product Manager' ? 'PRODUCT_MANAGER' : 
                               job.title === 'UX Designer' ? 'UX_DESIGNER' : 
                               job.title === 'Data Scientist' ? 'DATA_SCIENTIST' : 
                               job.title === 'DevOps Engineer' ? 'DEVOPS_ENGINEER' : 
                               'SALES_MANAGER';
                  navigate(`/careers/${jobId}`);
                }}
                className="group relative bg-white rounded-2xl shadow-card hover:shadow-glow-lg transition-all cursor-pointer border border-gray-100 overflow-hidden"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <motion.img
                    src={job.image}
                    alt={job.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                      {job.department}
                    </span>
                  </div>
                  <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${job.gradient}`}></div>
                </div>
                
                {/* Content Section */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{job.type}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-500 mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{job.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-600 group-hover:text-indigo-700 font-medium text-sm transition-colors">
                      Learn More →
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.button 
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 25px rgba(99, 102, 241, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/careers')}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-glow-lg flex items-center mx-auto group"
            >
              View All Openings
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="gradient-section py-20">
        <FAQSection />
      </section>

      {/* Premium Footer */}
      <footer className="gradient-section py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-8">
                <img 
                  src="/images/FLuid Live Icon.png" 
                  alt="FluidJobs.ai Logo" 
                  className="w-8 h-8 object-contain"
                  style={{ background: 'transparent', mixBlendMode: 'multiply' }}
                />
                <span className="font-heading font-bold text-2xl text-gray-900">FluidJobs.ai</span>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                The future of recruitment is here. Transform your hiring process with AI-powered intelligence and intuitive design.
              </p>
              <div className="flex space-x-4">
                {[Globe, Shield, Zap].map((Icon, index) => (
                  <div key={index} className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-300 cursor-pointer transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                ))}
              </div>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'API', 'Integrations', 'Security'] },
              { title: 'Company', links: ['About', 'Careers', 'Contact', 'Blog', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Documentation', 'Status', 'Community', 'Training'] }
            ].map((column, index) => (
              <div key={index}>
                <h3 className="font-heading font-semibold mb-6 text-lg">{column.title}</h3>
                <ul className="space-y-4">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-base">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-300 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-base">&copy; 2024 FluidJobs.ai. All rights reserved.</p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PremiumLandingPage;