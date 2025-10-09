import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQSection = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqs = [
    {
      question: "How accurate is the match score?",
      answer: "Our AI-powered matching system uses advanced algorithms to analyze candidate profiles against job requirements, achieving over 95% accuracy in matching relevant candidates to positions."
    },
    {
      question: "How long does the hiring process take?",
  answer: "On average, companies using FluidJobs.ai reduce their time-to-hire by 60%. Most positions are filled within 2-3 weeks, compared to the industry average of 6-8 weeks."
    },
    {
  question: "Can I integrate FluidJobs.ai with my existing HR tools?",
  answer: "Yes, FluidJobs.ai offers seamless integrations with popular HR tools including Workday, BambooHR, Greenhouse, and many others through our robust API."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We provide 24/7 customer support, dedicated account managers for enterprise clients, comprehensive documentation, and regular training sessions to ensure you get the most out of our platform."
    },
    {
  question: "Is my data secure with FluidJobs.ai?",
      answer: "Absolutely. We use enterprise-grade security measures including end-to-end encryption, SOC 2 compliance, and regular security audits to protect your sensitive hiring data."
    },
    {
  question: "Can I try FluidJobs.ai before committing?",
      answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required, and you can upgrade or cancel anytime."
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2C3E50] text-center mb-12">
          Frequently asked questions
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset rounded-lg"
              >
                <span className="text-lg font-medium text-gray-800 pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openItems.includes(index) ? (
                    <Minus className="w-5 h-5 text-purple-600" />
                  ) : (
                    <Plus className="w-5 h-5 text-purple-600" />
                  )}
                </div>
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-5">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;