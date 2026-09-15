import React from 'react';
import { Target, ShieldCheck, Zap, HelpCircle } from 'lucide-react';

export default function ReadinessScoreCard({ atsScore, readinessScore }) {
  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 55) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    if (score >= 40) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" /> Career Readiness Evaluation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Differentiating keyword presence (ATS) from concrete candidate proof (Readiness).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ATS Score */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-5">
          <div className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${getScoreColor(atsScore)}`}>
            <span className="text-3xl font-extrabold">{atsScore}%</span>
            <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5 opacity-80">ATS Match</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-400" /> ATS Compatibility
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Measures keyword presence, formatting structure, and phrasing alignment in your current resume.
            </p>
          </div>
        </div>

        {/* Job Readiness Score */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-blue-500/30 flex items-center gap-5">
          <div className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${getScoreColor(readinessScore)}`}>
            <span className="text-3xl font-extrabold">{readinessScore}%</span>
            <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5 opacity-80">Readiness</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Job Readiness Score
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Evaluates concrete Candidate Evidence Levels (0–4), project proof depth, and must-have requirement coverage.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
