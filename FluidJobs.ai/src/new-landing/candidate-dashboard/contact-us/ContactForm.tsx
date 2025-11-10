import React, { useState } from 'react';
import { useTheme, getThemeColors } from '../ThemeContext';

const ContactForm: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="p-6 rounded-xl shadow-md" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}>
      <h3 className="text-base font-bold mb-4" style={{ color: colors.textPrimary }}>Send us a message</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-1 text-left" style={{ color: colors.textPrimary }}>Name</label>
            <input 
              type="text" 
              id="name" 
              placeholder="Enter your name" 
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold focus:ring-1 focus:outline-none"
              style={{ 
                border: `1px solid ${colors.border}`, 
                backgroundColor: colors.bgMain, 
                color: colors.textPrimary
              } as React.CSSProperties}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1 text-left" style={{ color: colors.textPrimary }}>Email Address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Enter your email" 
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold focus:ring-1 focus:outline-none"
              style={{ 
                border: `1px solid ${colors.border}`, 
                backgroundColor: colors.bgMain, 
                color: colors.textPrimary
              } as React.CSSProperties}
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-semibold mb-1 text-left" style={{ color: colors.textPrimary }}>Subject</label>
          <input 
            type="text" 
            id="subject" 
            placeholder="Enter message subject" 
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl text-sm font-semibold focus:ring-1 focus:outline-none"
            style={{ 
              border: `1px solid ${colors.border}`, 
              backgroundColor: colors.bgMain, 
              color: colors.textPrimary
            } as React.CSSProperties}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold mb-1 text-left" style={{ color: colors.textPrimary }}>Message</label>
          <textarea 
            id="message" 
            rows={4} 
            placeholder="Enter your message..." 
            value={formData.message}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl text-sm font-semibold focus:ring-1 focus:outline-none"
            style={{ 
              border: `1px solid ${colors.border}`, 
              backgroundColor: colors.bgMain, 
              color: colors.textPrimary
            } as React.CSSProperties}
          />
        </div>

        <div className="pt-2 flex justify-center">
          <button 
            type="submit" 
            className="w-full md:w-auto px-12 py-2 font-semibold rounded-xl transition shadow-lg"
            style={{ backgroundColor: colors.accent, color: '#ffffff', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.5)' }}
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
