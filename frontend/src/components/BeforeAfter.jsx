import React from 'react';
import { ArrowLeftRight, ShieldCheck, Check } from 'lucide-react';

export default function BeforeAfter({ changesMade }) {
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <ArrowLeftRight className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Before / After Comparison</h3>
          <p className="text-xs text-slate-400">
            Compare original resume phrasing with the tailored, job-aligned version.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {changesMade && changesMade.length > 0 ? (
          changesMade.map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-sm font-bold text-blue-400">{item.section}</span>
                <span className="text-xs text-slate-400 italic">{item.rationale}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Original
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {item.original || '(No original text)'}
                  </p>
                </div>

                {/* Tailored */}
                <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                      Tailored (Truthful Optimization)
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3 h-3" /> Truth Preserved
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed font-mono">
                    {item.tailored}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 italic">No diff changes logged.</p>
        )}
      </div>
    </div>
  );
}
