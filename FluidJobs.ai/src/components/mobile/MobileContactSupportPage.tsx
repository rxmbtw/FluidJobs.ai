import React, { useState } from 'react';
import { Mail, Phone, MapPin, ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileContactSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await fetch('http://localhost:8000/api/contact-support/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div style={{ background: '#F1F1F1', height: '100vh', overflow: 'auto', paddingBottom: '120px', position: 'fixed', width: '100%', top: 0, left: 0 }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div style={{
          background: '#FFFFFF',
          borderRadius: '25px',
          padding: '20px',
          position: 'relative'
        }}>
          {/* Back Button */}
          <button
            onClick={() => navigate('/mobile-profile')}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '40px',
              height: '40px',
              background: '#FFFFFF',
              borderRadius: '12px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          >
            <ArrowLeft className="w-6 h-6" style={{ color: '#4285F4', strokeWidth: 2.5 }} />
          </button>

          <h1 style={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '30px',
            color: '#000000',
            textAlign: 'center',
            marginTop: '30px'
          }}>
            Contact Support
          </h1>
          <p style={{
            fontFamily: 'Poppins',
            fontWeight: 400,
            fontSize: '13px',
            color: '#6E6E6E',
            textAlign: 'center',
            marginTop: '4px'
          }}>
            Get in touch with our team
          </p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="px-4 pb-4">
        <div style={{
          background: '#FFFFFF',
          borderRadius: '25px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'rgba(66, 133, 244, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail className="w-5 h-5" style={{ color: '#4285F4' }} />
            </div>
            <div>
              <h3 style={{
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '13px',
                color: '#000000'
              }}>
                Email Address
              </h3>
              <p style={{
                fontFamily: 'Poppins',
                fontWeight: 400,
                fontSize: '12px',
                color: '#6E6E6E'
              }}>
                support@fluidjobs.ai
              </p>
            </div>
          </div>

          {/* Phone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'rgba(66, 133, 244, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Phone className="w-5 h-5" style={{ color: '#4285F4' }} />
            </div>
            <div>
              <h3 style={{
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '13px',
                color: '#000000'
              }}>
                Phone Number
              </h3>
              <p style={{
                fontFamily: 'Poppins',
                fontWeight: 400,
                fontSize: '12px',
                color: '#6E6E6E'
              }}>
                +91 9284XXXX
              </p>
            </div>
          </div>

          {/* Address */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'rgba(66, 133, 244, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <MapPin className="w-5 h-5" style={{ color: '#4285F4' }} />
            </div>
            <div>
              <h3 style={{
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '13px',
                color: '#000000',
                marginBottom: '4px'
              }}>
                Office Address
              </h3>
              <p style={{
                fontFamily: 'Poppins',
                fontWeight: 400,
                fontSize: '11px',
                color: '#6E6E6E',
                lineHeight: '16px'
              }}>
                Fluid.Live, Bungalow #2, Lane O, 81/1, Late Ganpat Dulaji Pingle Path, behind One Restaurant and Bar, Koregaon Park Annexe, Pune, Maharashtra 411036
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="px-4 pb-4">
        <div style={{
          background: '#FFFFFF',
          borderRadius: '25px',
          padding: '24px'
        }}>
          <h2 style={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '18px',
            color: '#000000',
            marginBottom: '20px'
          }}>
            Send us a message
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '13px',
                color: '#000000',
                display: 'block',
                marginBottom: '8px'
              }}>
                Name*
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                required
                style={{
                  width: '100%',
                  height: '44px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '10px',
                  padding: '0 16px',
                  fontFamily: 'Poppins',
                  fontSize: '13px',
                  color: '#000000'
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '13px',
                color: '#000000',
                display: 'block',
                marginBottom: '8px'
              }}>
                Email Address*
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
                style={{
                  width: '100%',
                  height: '44px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '10px',
                  padding: '0 16px',
                  fontFamily: 'Poppins',
                  fontSize: '13px',
                  color: '#000000'
                }}
              />
            </div>

            {/* Subject */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '13px',
                color: '#000000',
                display: 'block',
                marginBottom: '8px'
              }}>
                Subject*
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter message subject"
                required
                style={{
                  width: '100%',
                  height: '44px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '10px',
                  padding: '0 16px',
                  fontFamily: 'Poppins',
                  fontSize: '13px',
                  color: '#000000'
                }}
              />
            </div>

            {/* Message */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '13px',
                color: '#000000',
                display: 'block',
                marginBottom: '8px'
              }}>
                Message*
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter your message..."
                required
                rows={4}
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontFamily: 'Poppins',
                  fontSize: '13px',
                  color: '#000000',
                  resize: 'none'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                height: '48px',
                background: 'linear-gradient(90deg, #4285F4 0%, #0060FF 100%)',
                borderRadius: '12px',
                border: 'none',
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '15px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Map Section */}
      <div className="px-4 pb-4">
        <div style={{
          background: '#FFFFFF',
          borderRadius: '25px',
          padding: '16px',
          overflow: 'hidden'
        }}>
          <h3 style={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '16px',
            color: '#000000',
            marginBottom: '12px'
          }}>
            Our Location
          </h3>
          <div style={{
            width: '100%',
            height: '200px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.0267891234567!2d73.89876!3d18.53456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDMyJzA0LjQiTiA3M8KwNTMnNTUuNSJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileContactSupportPage;
