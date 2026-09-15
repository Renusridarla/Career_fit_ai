import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Sparkles, AlertCircle, Loader2, KeyRound } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = () => {
    setEmail('student@careerfit.ai');
    setPassword('Password123');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please fill out all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(cleanEmail, cleanPassword);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col text-slate-100">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 w-full max-w-md border border-slate-800 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-xs text-slate-400">Sign in to your AI CareerFit account</p>
          </div>

          {/* Quick Demo Fill Banner */}
          <div className="p-3.5 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-blue-300 block">Demo Account Available</span>
              <span className="text-slate-400 font-mono text-[11px]">student@careerfit.ai</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shrink-0 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" /> Auto-Fill Demo
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block">Email Address</label>
              <input
                type="email"
                placeholder="student@careerfit.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 font-semibold hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
