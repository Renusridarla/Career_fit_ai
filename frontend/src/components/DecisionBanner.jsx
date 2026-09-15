import React from 'react';
import { CheckCircle2, AlertOctagon, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DecisionBanner({ decision, rationale, prepTimeEstimate, topBlockers, onTailorClick }) {
  const isApplyNow = decision === 'APPLY NOW';

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl border shadow-xl transition-all ${
        isApplyNow
          ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border-emerald-500/40'
          : 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-rose-950/60 border-amber-500/40'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border flex items-center gap-1.5 ${
                isApplyNow
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {isApplyNow ? <CheckCircle2 className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
              {decision}
            </span>

            {prepTimeEstimate && (
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Est. Preparation: <span className="font-bold text-white">{prepTimeEstimate}</span>
              </span>
            )}
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {rationale}
          </p>

          {!isApplyNow && topBlockers && topBlockers.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Top Blockers to Resolve:
              </span>
              {topBlockers.map((blocker, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30"
                >
                  ! {blocker}
                </span>
              ))}
            </div>
          )}
        </div>

        {onTailorClick && (
          <button
            onClick={onTailorClick}
            className={`px-6 py-3.5 rounded-xl font-extrabold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 ${
              isApplyNow
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {isApplyNow ? 'Generate Tailored Resume' : 'View Actionable Roadmap'}
          </button>
        )}

      </div>
    </div>
  );
}
