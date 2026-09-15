import React, { useState, useEffect } from 'react';
import { Layers, Award, TrendingUp, Sparkles, Loader2, Check, X, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function JobHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await api.get('/comparison/heatmap');
        setData(res.data);
      } catch (err) {
        console.error('Heatmap load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
        <span>Loading Multiple Job Comparison Matrix...</span>
      </div>
    );
  }

  if (!data || !data.jobs || data.jobs.length === 0) {
    return null;
  }

  const { jobs, heatmap_matrix, best_fit, best_growth, highest_value_skill } = data;

  const renderStatusCell = (status) => {
    if (status === 'STRONG MATCH') return <span className="text-emerald-400 font-bold">✓</span>;
    if (status === 'PARTIAL MATCH') return <span className="text-amber-400 font-bold">~</span>;
    if (status === 'MISSING') return <span className="text-rose-400 font-bold">✗</span>;
    return <span className="text-slate-600 font-bold">-</span>;
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" /> Multiple Job Comparison & Skill Gap Heatmap
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Compare candidate evidence alignment across all target position postings to prioritize applications.
        </p>
      </div>

      {/* Best Fit vs Best Growth Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Best Fit */}
        {best_fit && (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Award className="w-4 h-4" /> Best Current Fit
            </div>
            <h4 className="text-sm font-extrabold text-white">{best_fit.title}</h4>
            <div className="text-xs text-emerald-300 font-semibold">
              Readiness: {best_fit.score}%
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{best_fit.reason}</p>
          </div>
        )}

        {/* Best Growth */}
        {best_growth && (
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <TrendingUp className="w-4 h-4" /> Best Growth Opportunity
            </div>
            <h4 className="text-sm font-extrabold text-white">{best_growth.title}</h4>
            <div className="text-xs text-indigo-300 font-semibold">
              Readiness: {best_growth.score}%
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{best_growth.reason}</p>
          </div>
        )}

        {/* Highest Value Skill to Learn */}
        {highest_value_skill && (
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" /> Highest-Value Skill to Learn
            </div>
            <h4 className="text-sm font-extrabold text-white">{highest_value_skill.skill}</h4>
            <div className="text-xs text-amber-300 font-semibold">
              Missing in {highest_value_skill.missing_in_count} of {highest_value_skill.total_jobs} target jobs
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{highest_value_skill.reason}</p>
          </div>
        )}

      </div>

      {/* Cross-Job Heatmap Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3">Skill / Requirement</th>
              {jobs.map((j, jidx) => (
                <th key={jidx} className="p-3 text-center">
                  <div className="font-bold text-white text-xs">{j.company}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{j.title}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {heatmap_matrix.map((row, ridx) => (
              <tr key={ridx} className="hover:bg-slate-800/40">
                <td className="p-3 font-sans font-bold text-white flex items-center justify-between">
                  <span>{row.skill}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({row.occurrences} jobs)</span>
                </td>
                {jobs.map((j, jidx) => (
                  <td key={jidx} className="p-3 text-center text-sm">
                    {renderStatusCell(row.job_statuses[j.job_id])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
