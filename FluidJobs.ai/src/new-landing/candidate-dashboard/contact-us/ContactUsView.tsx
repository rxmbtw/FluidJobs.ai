import React, { useState } from 'react';
import DashboardHeader from '../DashboardHeader';
import Sidebar from '../Sidebar';
import MobileSidebar from '../MobileSidebar';
import ContactInfoCard from './ContactInfoCard';
import ContactForm from './ContactForm';
import MapAddressSection from './MapAddressSection';
import { useTheme, getThemeColors } from '../ThemeContext';

interface ContactUsViewProps {
  onNavigate: (view: string) => void;
}

const ContactUsView: React.FC<ContactUsViewProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [userName] = useState('Shriram Surse');

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: colors.bgMain, color: colors.textPrimary, width: '100%' }}>
      <DashboardHeader onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} onSavedJobsClick={() => onNavigate('savedJobs')} />
      
      <div className="flex" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <Sidebar userName={userName} onNavigate={onNavigate} currentView="contact" />
        <MobileSidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)}
          userName={userName}
        />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto" style={{ backgroundColor: colors.bgMain }}>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-1 text-left" style={{ color: colors.textPrimary }}>Contact Us</h2>
            <p className="text-base font-semibold" style={{ color: colors.textSecondary }}>Get in touch with our team</p>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <ContactInfoCard type="email" title="Email Address" value="support@fluidjobs.ai" />
            <ContactInfoCard type="phone" title="Phone Number" value="+91 98765 XXXXX" />
            <ContactInfoCard type="address" title="Office Address/Location:" />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
            <MapAddressSection />
          </section>
        </main>
      </div>
    </div>
  );
};

export default ContactUsView;
