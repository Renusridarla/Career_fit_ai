import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Briefcase, PlusCircle, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-[#151C2C]/60 backdrop-blur-md border-r border-slate-800 min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <div className="space-y-6">
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Navigation
          </h3>
          <nav className="space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive('/dashboard') 
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/resume"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive('/resume') 
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              Master Resume
            </Link>

            <Link
              to="/jobs"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive('/jobs') 
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Job History
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Actions
          </h3>
          <Link
            to="/jobs/new"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Analyze Job
          </Link>
        </div>

        {/* Truthfulness Badge */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            100% Anti-Fabrication
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            AI CareerFit guarantees zero fabricated qualifications. Only genuine experience is tailored.
          </p>
        </div>
      </div>
    </aside>
  );
}
