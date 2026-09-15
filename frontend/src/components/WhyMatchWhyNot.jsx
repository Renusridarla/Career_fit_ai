import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ChevronDown, ChevronUp, Layers } from 'lucide-react';

export default function WhyMatchWhyNot({ whyMatch, whyNotMatch }) {
  const [activeTab, setActiveTab] = useState('match');

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" /> Explainable AI Evaluation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent proof breakdown explaining why you match or miss each requirement.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('match')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'match'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Why Do I Match? ({whyMatch?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('not_match')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'not_match'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Why Don't I Match? ({whyNotMatch?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'match' ? (
        <div className="space-y-4">
          {whyMatch && whyMatch.length > 0 ? (
            whyMatch.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-sm font-bold text-white">{item.requirement}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.importance}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                    {item.evidence_level_desc}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  {item.explanation}
                </p>

                {item.evidence_snippets && item.evidence_snippets.length > 0 && (
                  <div className="pl-6 pt-1 space-y-1">
                    {item.evidence_snippets.map((snip, sidx) => (
                      <div key={sidx} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
                        ✓ {snip}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No matched requirements found.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {whyNotMatch && whyNotMatch.length > 0 ? (
            whyNotMatch.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-sm font-bold text-white">{item.requirement}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.importance}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                    {item.impact}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  <strong className="text-slate-200">Reason:</strong> {item.reason}
                </p>

                <div className="pl-6 pt-1">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                    <strong>Actionable Recommendation:</strong> {item.recommendation}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-emerald-400 font-medium">No missing requirements!</p>
          )}
        </div>
      )}
    </div>
  );
}
