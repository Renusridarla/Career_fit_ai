import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Briefcase, PlusCircle, Trash2, ArrowRight, Loader2 } from 'lucide-react';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId) => {
    if (window.confirm('Delete this job analysis history?')) {
      try {
        await api.delete(`/jobs/${jobId}`);
        setJobs(prev => prev.filter(j => j.id !== jobId));
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete job description.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col text-slate-100">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Job Analysis History</h1>
              <p className="text-sm text-slate-400 mt-1">
                View all analyzed job postings, match reports, and tailored resume exports.
              </p>
            </div>

            <Link
              to="/jobs/new"
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" /> Analyze New Job
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <span>Loading job history...</span>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="glass-card glass-card-hover rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white line-clamp-1">{job.title}</h3>
                        <p className="text-xs text-slate-400 font-medium">{job.company}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-3">
                      {job.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/jobs/${job.id}/analysis`}
                      className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1"
                    >
                      View Analysis <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No job history found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Paste a target job description to compute your match score and view personalized recommendations.
              </p>
              <Link
                to="/jobs/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all mt-2"
              >
                <PlusCircle className="w-4 h-4" /> Analyze First Job
              </Link>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
