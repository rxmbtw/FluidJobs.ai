import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactSupportView: React.FC = () => {
  console.log('ContactSupportView rendered');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="relative w-full min-h-[716px] bg-[#F1F1F1] rounded-t-[50px] p-8 mt-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[23px] font-bold font-['Poppins'] text-black mb-2">
          Contact Support
        </h1>
        <p className="text-[13px] font-semibold font-['Poppins'] text-[#6E6E6E]">
          Get in touch with our team
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Email Card */}
        <div className="bg-white rounded-[10px] p-5 flex items-center space-x-4">
          <div className="w-6 h-6 flex items-center justify-center">
            <Mail className="w-5 h-5 text-[#4285F4]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold font-['Poppins'] text-black">
              Email Address
            </h3>
            <p className="text-[13px] font-semibold font-['Poppins'] text-[#6E6E6E]">
              support@fluidjobs.ai
            </p>
          </div>
        </div>

        {/* Phone Card */}
        <div className="bg-white rounded-[10px] p-5 flex items-center space-x-4">
          <div className="w-6 h-6 flex items-center justify-center">
            <Phone className="w-5 h-5 text-[#4285F4]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold font-['Poppins'] text-black">
              Phone Number
            </h3>
            <p className="text-[13px] font-semibold font-['Poppins'] text-[#6E6E6E]">
              +91 98765 XXXXX
            </p>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-[10px] p-5 flex items-center space-x-4">
          <div className="w-6 h-6 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#4285F4]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold font-['Poppins'] text-black">
              Office Address/Location:
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white rounded-[10px] p-6">
          <h2 className="text-[15px] font-bold font-['Poppins'] text-black mb-6">
            Send us a message
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Name Input */}
              <div>
                <label className="block text-[13px] font-semibold font-['Poppins'] text-black mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full h-[39px] px-4 bg-white border border-[rgba(0,0,0,0.2)] rounded-[10px] text-[13px] font-semibold font-['Poppins'] text-[#6E6E6E] placeholder:text-[#6E6E6E] focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-[13px] font-semibold font-['Poppins'] text-black mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full h-[39px] px-4 bg-white border border-[rgba(0,0,0,0.2)] rounded-[10px] text-[13px] font-semibold font-['Poppins'] text-[#6E6E6E] placeholder:text-[#6E6E6E] focus:outline-none focus:border-[#4285F4]"
                />
              </div>
            </div>

            {/* Subject Input */}
            <div className="mb-4">
              <label className="block text-[13px] font-semibold font-['Poppins'] text-black mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter message subject"
                className="w-full h-[39px] px-4 bg-white border border-[rgba(0,0,0,0.2)] rounded-[10px] text-[13px] font-semibold font-['Poppins'] text-[#6E6E6E] placeholder:text-[#6E6E6E] focus:outline-none focus:border-[#4285F4]"
              />
            </div>

            {/* Message Textarea */}
            <div className="mb-6">
              <label className="block text-[13px] font-semibold font-['Poppins'] text-black mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter your message..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-[rgba(0,0,0,0.2)] rounded-[10px] text-[13px] font-semibold font-['Poppins'] text-[#6E6E6E] placeholder:text-[#6E6E6E] focus:outline-none focus:border-[#4285F4] resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-[39px] bg-gradient-to-r from-[#4285F4] to-[#0060FF] rounded-[10px] text-[13px] font-semibold font-['Poppins'] text-white hover:opacity-90 transition-opacity"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Map and Address Section */}
        <div className="space-y-4">
          {/* Map */}
          <div className="bg-white rounded-[10px] border-2 border-[rgba(0,0,0,0.3)] h-[283px] overflow-hidden relative">
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

          {/* Address Card */}
          <div className="bg-white rounded-[10px] p-4">
            <p className="text-[13px] font-semibold font-['Poppins'] text-[#4285F4] leading-5">
              <span className="text-black">Address:</span> Fluid.Live, Bungalow #2, Lane O, 81/1, 
              Late Ganpat Dulaji Pingle Path, behind One Restaurant and Bar, 
              Koregaon Park Annexe, Pune, Maharashtra 411036
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupportView;
