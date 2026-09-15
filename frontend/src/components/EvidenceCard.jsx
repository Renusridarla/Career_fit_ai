import React from 'react';
import { FileCheck, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';

export default function EvidenceCard({ evidence }) {
  const getBadgeClass = (category) => {
    if (category === 'STRONG MATCH') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (category === 'PARTIAL MATCH') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  const getIcon = (category) => {
    if (category === 'STRONG MATCH') return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (category === 'PARTIAL MATCH') return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
    return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Evidence Mapping</h3>
          <p className="text-xs text-slate-400">
            Transparent verification showing exactly where each job requirement is backed by evidence in your Master Resume profile.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {evidence && evidence.length > 0 ? (
          evidence.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getIcon(item.category)}
                  <span className="text-sm font-bold text-white">{item.requirement}</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {item.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-300 pl-6 leading-relaxed">
                  {item.evidence_text}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.source_section !== 'None' && (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                    {item.source_section}
                  </span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${getBadgeClass(item.category)}`}>
                  {item.category}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 italic">No evidence data available.</p>
        )}
      </div>
    </div>
  );
}
