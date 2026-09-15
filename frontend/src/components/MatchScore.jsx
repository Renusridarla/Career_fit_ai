import React from 'react';
import { Target, Award, Code, Briefcase, FolderGit2, GraduationCap, FileCheck } from 'lucide-react';

export default function MatchScore({ overallScore, categoryScores }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    if (score >= 40) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getBarColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const categories = [
    { label: 'Technical Skills', weight: '40%', score: categoryScores?.technical_skills || 0, icon: Code },
    { label: 'Work Experience', weight: '20%', score: categoryScores?.experience || 0, icon: Briefcase },
    { label: 'Key Projects', weight: '15%', score: categoryScores?.projects || 0, icon: FolderGit2 },
    { label: 'Responsibilities', weight: '15%', score: categoryScores?.responsibilities || 0, icon: FileCheck },
    { label: 'Education', weight: '10%', score: categoryScores?.education || 0, icon: GraduationCap },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Overall Score Badge */}
        <div className="flex flex-col items-center text-center">
          <div className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-xl ${getScoreColor(overallScore)}`}>
            <span className="text-4xl font-extrabold tracking-tight">{overallScore}%</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider mt-1 opacity-80">Alignment</span>
          </div>
          <p className="text-xs text-slate-400 mt-3 font-medium">
            Resume-to-Job Alignment Score
          </p>
        </div>

        {/* Category Breakdown */}
        <div className="flex-1 w-full space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" /> Category Breakdown
          </h3>

          <div className="space-y-3">
            {categories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-slate-200">
                      <IconComp className="w-3.5 h-3.5 text-slate-400" />
                      {cat.label}
                      <span className="text-[10px] text-slate-500 font-mono">({cat.weight})</span>
                    </div>
                    <span className="font-bold text-slate-200">{cat.score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(cat.score)}`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
