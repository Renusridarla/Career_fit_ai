import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function SkillMatchCard({ matchedSkills, partialMatches, missingSkills }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* Strong Matches */}
      <div className="glass-card rounded-2xl p-5 border-emerald-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" /> Strong Matches
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
            {matchedSkills?.length || 0}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {matchedSkills && matchedSkills.length > 0 ? (
            matchedSkills.map((skill, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                ✓ {skill}
              </span>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">No strong matches found.</p>
          )}
        </div>
      </div>

      {/* Partial Matches */}
      <div className="glass-card rounded-2xl p-5 border-amber-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4" /> Partial Matches
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">
            {partialMatches?.length || 0}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {partialMatches && partialMatches.length > 0 ? (
            partialMatches.map((skill, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                ~ {skill}
              </span>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">No partial matches.</p>
          )}
        </div>
      </div>

      {/* Missing Requirements */}
      <div className="glass-card rounded-2xl p-5 border-rose-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <XCircle className="w-4 h-4" /> Missing Requirements
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300">
            {missingSkills?.length || 0}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {missingSkills && missingSkills.length > 0 ? (
            missingSkills.map((skill, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20">
                ! {skill}
              </span>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">No missing requirements!</p>
          )}
        </div>
      </div>

    </div>
  );
}
