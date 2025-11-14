import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

interface NewUIContactSupportProps {
  themeState: 'light' | 'dark';
}

const NewUIContactSupport: React.FC<NewUIContactSupportProps> = ({ themeState }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="w-full min-h-[716px] rounded-t-[50px] p-8 pt-6" style={{ backgroundColor: themeState === 'light' ? '#F1F1F1' : '#1a1a1a' }}>
      <div className="mb-6">
        <h1 className="text-[23px] font-bold font-['Poppins'] mb-1" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
          Contact Support
        </h1>
        <p className="text-[13px] font-semibold font-['Poppins'] text-[#6E6E6E]">
          Get in touch with our team
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-[10px] p-5 flex items-center space-x-4" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
          <Mail className="w-6 h-6 text-[#4285F4]" />
          <div>
            <h3 className="text-[15px] font-bold font-['Poppins']" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
              Email Address
            </h3>
            <p className="text-[13px] font-semibold font-['Poppins'] text-[#6E6E6E]">
              support@fluidjobs.ai
            </p>
          </div>
        </div>

        <div className="rounded-[10px] p-5 flex items-center space-x-4" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
          <Phone className="w-6 h-6 text-[#4285F4]" />
          <div>
            <h3 className="text-[15px] font-bold font-['Poppins']" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
              Phone Number
            </h3>
            <p className="text-[13px] font-semibold font-['Poppins'] text-[#6E6E6E]">
              +91 98765 XXXXX
            </p>
          </div>
        </div>

        <div className="rounded-[10px] p-5 flex items-center space-x-4" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
          <MapPin className="w-6 h-6 text-[#4285F4]" />
          <div>
            <h3 className="text-[15px] font-bold font-['Poppins']" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
              Office Address/Location:
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-[10px] p-6" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
          <h2 className="text-[15px] font-bold font-['Poppins'] mb-6" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
            Send us a message
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[13px] font-semibold font-['Poppins'] mb-2" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full h-[39px] px-4 border border-[rgba(0,0,0,0.2)] rounded-[10px] text-[13px] font-semibold font-['Poppins'] focus:outline-none focus:border-[#4285F4]"
                  style={{ 
                    backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151',
                    color: themeState === 'light' ? '#6E6E6E' : '#E5E7EB'
                  }}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold font-['Poppins'] mb-2" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full h-[39px] px-4 border border-[rgba(0,0,0,0.2)] rounded-[10px] text-[13px] font-semibold font-['Poppins'] focus:outline-none focus:border-[#4285F4]"
                  style={{ 
                    backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151',
                    color: themeState === 'light' ? '#6E6E6E' : '#E5E7EB'
                  }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[13px] font-semibold font-['Poppins'] mb-2" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter message subject"
                className="w-full h-[39px] px-4 border border-[rgba(0,0,0,0.2)] rounded-[10px] text-[13px] font-semibold font-['Poppins'] focus:outline-none focus:border-[#4285F4]"
                style={{ 
                  backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151',
                  color: themeState === 'light' ? '#6E6E6E' : '#E5E7EB'
                }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-[13px] font-semibold font-['Poppins'] mb-2" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter your message..."
                rows={3}
                className="w-full px-4 py-3 border border-[rgba(0,0,0,0.2)] rounded-[10px] text-[13px] font-semibold font-['Poppins'] focus:outline-none focus:border-[#4285F4] resize-none"
                style={{ 
                  backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151',
                  color: themeState === 'light' ? '#6E6E6E' : '#E5E7EB'
                }}
              />
            </div>

            <button
              type="submit"
              className="w-full h-[39px] bg-gradient-to-r from-[#4285F4] to-[#0060FF] rounded-[10px] text-[13px] font-semibold font-['Poppins'] text-white hover:opacity-90 transition-opacity"
            >
              Send Message
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-[10px] border-2 border-[rgba(0,0,0,0.3)] h-[283px] overflow-hidden relative" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.0267891234567!2d73.89876!3d18.53456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDMyJzA0LjQiTiA3M8KwNTMnNTUuNSJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <MapPin className="w-8 h-8 text-black" />
            </div>
          </div>

          <div className="rounded-[10px] p-4" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
            <p className="text-[13px] font-semibold font-['Poppins'] leading-5">
              <span style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>Address:</span>{' '}
              <span className="text-[#4285F4]">
                Fluid.Live, Bungalow #2, Lane O, 81/1, Late Ganpat Dulaji Pingle Path, 
                behind One Restaurant and Bar, Koregaon Park Annexe, Pune, Maharashtra 411036
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewUIContactSupport;
