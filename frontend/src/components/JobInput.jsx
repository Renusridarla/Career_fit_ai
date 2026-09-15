import React, { useState } from 'react';
import { Briefcase, Building, MapPin, Link2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function JobInput() {
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company.trim() || !title.trim() || !description.trim()) {
      setError('Please fill out Company Name, Job Title, and Job Description.');
      return;
    }

    if (description.trim().length < 20) {
      setError('Job description is too short. Please paste the full job posting text.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusText('Saving Job Description...');

    try {
      // 1. Create Job
      const jobRes = await api.post('/jobs', {
        company,
        title,
        url: url.trim() || null,
        location: location.trim() || null,
        description
      });

      const jobId = jobRes.data.id;

      // 2. Run Analysis
      setStatusText('Analyzing job requirements with AI...');
      const analysisRes = await api.post(`/analysis/${jobId}`);

      setStatusText('Analysis complete!');
      navigate(`/jobs/${jobId}/analysis`);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.detail || 'Failed to analyze job description.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Analyze New Job Description</h2>
          <p className="text-sm text-slate-400">
            Paste the target job posting to compute alignment and generate recommendations.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-400" /> Company Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Google, Infosys, Startup X"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Job Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Software Engineer, Full Stack Developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-slate-400" /> Job URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://careers.company.com/job/123"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Remote, San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">
            Job Description *
          </label>
          <textarea
            rows={8}
            placeholder="Paste the full job description text here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs leading-relaxed"
          />
        </div>

        {isLoading && (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3 text-blue-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            <span>{statusText}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isLoading ? 'Analyzing...' : 'Analyze Job Description'}
          </button>
        </div>
      </form>
    </div>
  );
}
