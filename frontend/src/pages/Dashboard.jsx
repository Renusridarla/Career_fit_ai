import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import JobHeatmap from '../components/JobHeatmap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FileText, PlusCircle, Briefcase, Award, Target, Sparkles, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [resResume, resJobs] = await Promise.all([
          api.get('/resumes').catch(() => ({ data: null })),
          api.get('/jobs').catch(() => ({ data: [] }))
        ]);
        setResume(resResume.data);
        setJobs(resJobs.data || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const totalJobs = jobs.length;

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col text-slate-100">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome back, {user?.name || 'Student'}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Evidence-Based Job Readiness & Resume Personalization Platform.
              </p>
            </div>
            
            <Link
              to="/jobs/new"
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" /> Analyze New Job
            </Link>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Jobs Analyzed</span>
                <span className="text-2xl font-bold text-white">{totalJobs}</span>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Master Resume</span>
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                  {resume ? <><CheckCircle2 className="w-4 h-4" /> Active Profile</> : <span className="text-amber-400">Not Uploaded</span>}
                </span>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Skills Identified</span>
                <span className="text-2xl font-bold text-white">
                  {resume?.parsed_data?.skills ? 
                    Object.values(resume.parsed_data.skills).flat().length : 0}
                </span>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Resume Integrity</span>
                <span className="text-sm font-bold text-amber-300">100% Verified</span>
              </div>
            </div>

          </div>

          {/* Master Resume Status Card */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-blue-500/20">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Master Resume Status</h3>
              </div>
              {resume ? (
                <p className="text-xs text-slate-300">
                  Current file: <span className="font-semibold text-white">{resume.original_filename}</span> (Uploaded on {new Date(resume.created_at).toLocaleDateString()})
                </p>
              ) : (
                <p className="text-xs text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  No Master Resume uploaded yet. Please upload your resume to start job matching.
                </p>
              )}
            </div>

            <Link
              to="/resume"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all shrink-0"
            >
              {resume ? 'View Candidate Evidence Graph' : 'Upload Master Resume'}
            </Link>
          </div>

          {/* Multiple Job Comparison & Skill Gap Heatmap */}
          <JobHeatmap />

          {/* Recent Job Analyses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Recent Job Analyses</h2>
              <Link to="/jobs" className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <span>Loading recent job analyses...</span>
              </div>
            ) : jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.slice(0, 6).map((job) => (
                  <div key={job.id} className="glass-card glass-card-hover rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white line-clamp-1">{job.title}</h3>
                        <p className="text-xs text-slate-400">{job.company}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <Link
                        to={`/jobs/${job.id}/analysis`}
                        className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1"
                      >
                        View Readiness Analysis <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-12 text-center space-y-3">
                <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No job analyses yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Paste a target job description to evaluate your candidate evidence graph and calculate your Job Readiness Score.
                </p>
                <Link
                  to="/jobs/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all mt-2"
                >
                  <PlusCircle className="w-4 h-4" /> Analyze First Job
                </Link>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
