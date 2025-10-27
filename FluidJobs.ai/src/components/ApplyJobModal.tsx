import React, { useState } from 'react';

const steps = [
  'Personal Info',
  'Resume',
  'LinkedIn/GitHub',
  'Skills',
  'Preview',
];

const ApplyJobModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    email: '',
    resume: '',
    linkedin: '',
    github: '',
    skills: '',
  });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    if (step === 0 && (!form.name || !form.email)) return 'Name and email required.';
    if (step === 1 && !form.resume) return 'Resume required.';
    return '';
  };

  const handleNext = () => {
    const err = validate();
    if (err) return setError(err);
    setError('');
    setStep(s => s + 1);
  };

  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-lg relative">
        <button className="absolute top-2 right-2" onClick={onClose}>✕</button>
        <h2 className="text-xl font-bold mb-4">Apply for Job</h2>
        <div className="mb-4 flex gap-2">
          {steps.map((s, i) => (
            <span key={s} className={`px-2 py-1 rounded ${i === step ? 'bg-primary text-white' : 'bg-neutral text-gray-500'}`}>{s}</span>
          ))}
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {!submitted ? (
          <form onSubmit={e => { e.preventDefault(); step === steps.length - 1 ? handleSubmit() : handleNext(); }}>
            {step === 0 && (
              <div className="mb-4">
                <input className="border p-2 w-full mb-2" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <input className="border p-2 w-full" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            )}
            {step === 1 && (
              <div className="mb-4">
                <input className="border p-2 w-full" placeholder="Resume URL" value={form.resume} onChange={e => setForm(f => ({ ...f, resume: e.target.value }))} />
              </div>
            )}
            {step === 2 && (
              <div className="mb-4">
                <input className="border p-2 w-full mb-2" placeholder="LinkedIn" value={form.linkedin} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} />
                <input className="border p-2 w-full" placeholder="GitHub" value={form.github} onChange={e => setForm(f => ({ ...f, github: e.target.value }))} />
              </div>
            )}
            {step === 3 && (
              <div className="mb-4">
                <input className="border p-2 w-full" placeholder="Skills" value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
              </div>
            )}
            {step === 4 && (
              <div className="mb-4">
                <div><strong>Name:</strong> {form.name}</div>
                <div><strong>Email:</strong> {form.email}</div>
                <div><strong>Resume:</strong> {form.resume}</div>
                <div><strong>LinkedIn:</strong> {form.linkedin}</div>
                <div><strong>GitHub:</strong> {form.github}</div>
                <div><strong>Skills:</strong> {form.skills}</div>
              </div>
            )}
            <div className="flex justify-between">
              {step > 0 && <button type="button" className="px-4 py-2 bg-neutral text-gray-700 rounded" onClick={handlePrev}>Back</button>}
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
                {step === steps.length - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-green-600 font-bold text-center">Application submitted successfully!</div>
        )}
      </div>
    </div>
  );
};

export default ApplyJobModal;
