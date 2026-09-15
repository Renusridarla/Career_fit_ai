import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function IntegrityBadge({ integrityScore, auditReport }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <div
        onClick={() => setShowModal(true)}
        className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 text-xs font-bold hover:bg-emerald-500/20 transition-all"
        title="Click to view 100% Truth Audit Report"
      >
        <ShieldCheck className="w-4 h-4" />
        Resume Integrity: {integrityScore}% Verified
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-4 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <ShieldCheck className="w-5 h-5" /> 100% Resume Integrity Audit Report
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs font-bold">
                Close
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Every bullet point and claim in your tailored resume has been compared against your Candidate Evidence Graph. Unsupported claims are blocked automatically.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {auditReport && auditReport.length > 0 ? (
                auditReport.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5 text-xs">
                    {item.status === 'VERIFIED FACT' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-white block">{item.claim}</span>
                      <span className="text-[11px] text-slate-400">{item.reason}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">All claims verified.</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
