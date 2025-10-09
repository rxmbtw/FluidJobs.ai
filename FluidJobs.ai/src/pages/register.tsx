import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthProvider';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Candidate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return setError('Name, email and password are required');
    }
    
    setLoading(true);
    setError('');
    
    try {
      await signup(name, email, password, role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="max-w-md mx-auto mt-16 bg-white p-8 rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Register</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <input className="border p-2 w-full mb-2" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
      <input className="border p-2 w-full mb-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="border p-2 w-full mb-2" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <select className="border p-2 w-full mb-4" value={role || ''} onChange={e => setRole(e.target.value as UserRole)}>
        <option value="Admin">Admin</option>
        <option value="HR">HR</option>
        <option value="Candidate">Candidate</option>
        <option value="Client">Client</option>
      </select>
      <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded w-full">
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default Register;
