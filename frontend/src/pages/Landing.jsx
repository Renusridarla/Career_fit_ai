import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Sparkles, ShieldCheck, Target, Compass, FileCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8">
          <ShieldCheck className="w-4 h-4" /> 100% Anti-Fabrication Guarantee
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Tailor your resume to the right job — <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">without compromising the truth.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Upload your master resume, paste a job description, and let AI identify your strengths, gaps, and the most relevant experience to highlight.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
          >
            Analyze Your Resume <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-base text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How AI CareerFit Works</h2>
          <p className="text-sm text-slate-400 mt-2">Built for students seeking genuine, ATS-optimized career advancement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              1
            </div>
            <h3 className="text-lg font-bold text-white">Master Resume Parsing</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload your resume once in PDF or DOCX format. Our structured parser extracts your skills, projects, and genuine work experience.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              2
            </div>
            <h3 className="text-lg font-bold text-white">Requirement & Evidence Matching</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Our multi-layer matching engine compares target job requirements against your profile, mapping concrete evidence and calculating transparent scores.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              3
            </div>
            <h3 className="text-lg font-bold text-white">Truthful Tailoring & Export</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate job-aligned PDF or DOCX resumes. Missing skills are never fake-added — instead, they are routed to a personalized learning roadmap.
            </p>
          </div>

        </div>
      </section>

      {/* Truth Guarantee Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" /> Strictly Truthful AI Optimization
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Unlike generic resume generators that invent qualifications, AI CareerFit guarantees that zero fake skills, projects, or job titles are ever inserted into your resume.
            </p>
          </div>
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all shrink-0"
          >
            Start Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-300">AI CareerFit Platform</span>
          </div>
          <p>© 2026 AI CareerFit. Production AI Student Career Assistant.</p>
        </div>
      </footer>
    </div>
  );
}
