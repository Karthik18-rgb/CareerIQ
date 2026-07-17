import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, error, loading, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '', username: '', password: '', full_name: '',
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) clearError();
    if (localError) setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.username.trim() || !form.password.trim()) {
      setLocalError('Email, username, and password are required.');
      return;
    }
    try {
      await register({
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
        full_name: form.full_name.trim() || undefined,
      });
      navigate('/dashboard', { replace: true });
    } catch {
      // error is set in AuthContext
    }
  };

  const displayError = typeof (localError || error) === 'string' ? (localError || error) : null;

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 shadow-premium">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src="/logo.svg" alt="CareerIQ" className="h-10 w-auto" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-gray-400 mt-1">Join CareerIQ and boost your career</p>
          </div>

          {displayError && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
            >
              {displayError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Full Name <span className="text-gray-500">(optional)</span>
              </label>
              <input id="full_name" name="full_name" type="text" value={form.full_name} onChange={handleChange} className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
              <input id="username" name="username" type="text" autoComplete="username" value={form.username} onChange={handleChange} className="input-field" placeholder="johndoe" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} className="input-field" placeholder="••••••••" />
              <p className="text-xs text-gray-500 mt-1">Min 8 chars, upper, lower, digit, special char.</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
