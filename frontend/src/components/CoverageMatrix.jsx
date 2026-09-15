import React, { useState } from 'react';
import { Table, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';

export default function CoverageMatrix({ coverageMatrix }) {
  const [selectedItem, setSelectedItem] = useState(null);

  const getStatusBadge = (status) => {
    if (status === 'STRONG MATCH') return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Strong Match</span>;
    if (status === 'PARTIAL MATCH') return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Partial Match</span>;
    return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Missing</span>;
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Table className="w-5 h-5 text-blue-400" /> Requirement $\rightarrow$ Resume Coverage Matrix
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Interactive matrix mapping every job requirement directly to candidate profile evidence and section location.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3.5 rounded-l-xl">Job Requirement</th>
              <th className="p-3.5">Importance</th>
              <th className="p-3.5">Evidence Level</th>
              <th className="p-3.5">Coverage Status</th>
              <th className="p-3.5 rounded-r-xl">Resume Section</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {coverageMatrix && coverageMatrix.length > 0 ? (
              coverageMatrix.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedItem(item)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="p-3.5 font-bold text-white flex items-center gap-2">
                    {item.requirement}
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.importance}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium text-slate-200">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-blue-300 border border-slate-700">
                      L{item.evidence_level}: {item.evidence_level_desc.split('(')[0]}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {getStatusBadge(item.match_status)}
                  </td>
                  <td className="p-3.5 font-medium text-slate-400 flex items-center justify-between">
                    <span>{item.section}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500 italic">No matrix items available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal / Drawer */}
      {selectedItem && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Requirement: <span className="text-blue-400">{selectedItem.requirement}</span>
            </h4>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-slate-300">
            <strong>Evidence Snippets:</strong>
          </p>
          {selectedItem.evidence_snippets && selectedItem.evidence_snippets.length > 0 ? (
            selectedItem.evidence_snippets.map((snip, sidx) => (
              <p key={sidx} className="text-xs font-mono text-slate-300 p-2 rounded bg-slate-950 border border-slate-800">
                ✓ {snip}
              </p>
            ))
          ) : (
            <p className="text-xs text-rose-400 italic">No explicit bullet-point evidence found in candidate profile.</p>
          )}
        </div>
      )}
    </div>
  );
}
