import React from 'react';
import TestimonialCard from './TestimonialCard';

const testimonials = [
  {
    quote: "FluidJobs.ai completely changed how I approach hiring. The AI match score is scarily accurate and saved us countless hours.",
    name: "Sarah Jennings",
    role: "Head of Talent, TechCorp",
    avatarUrl: "https://i.pravatar.cc/150?u=sarahjennings"
  },
  {
    quote: "As a developer, I was tired of generic job boards. FluidJobs found me a role that perfectly matched my niche skillset in under a week. Mind-blowing.",
    name: "Michael Chen",
    role: "Senior Full-Stack Engineer, Innovate Solutions",
    avatarUrl: "https://i.pravatar.cc/150?u=michaelchen"
  },
  {
    quote: "The AI Career Coach is a game-changer. It gave me the confidence and the right keywords to land my dream job in a competitive market.",
    name: "Jessica Rodriguez",
    role: "Product Manager, FutureWave",
    avatarUrl: "https://i.pravatar.cc/150?u=jessicarodriguez"
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="w-full py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Trusted by
            <br />
            <span className="brand-gradient-text font-medium">Top Professionals</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            See how FluidJobs.ai is empowering careers and companies worldwide.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
              avatarUrl={testimonial.avatarUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
