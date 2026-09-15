import React from 'react';
import { AlertCircle, Lightbulb } from 'lucide-react';

export default function SkillGapCard({ learningPlan }) {
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Skill Gap Analysis</h3>
          <p className="text-xs text-slate-400">
            Identified missing requirements with clear explanations of why they matter and how to build them.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {learningPlan && learningPlan.length > 0 ? (
          learningPlan.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-400">{item.skill}</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {item.importance}
                  </span>
                </div>
                {item.related_skill !== 'None' && (
                  <span className="text-xs text-slate-400 font-medium">
                    Building on: <span className="text-slate-200">{item.related_skill}</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-slate-200">Why it matters:</strong> {item.reason}
              </p>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2 text-xs text-blue-300">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                <span><strong>Recommendation:</strong> {item.recommendation}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-emerald-400 font-medium">Great job! You have no major missing skill gaps for this job.</p>
        )}
      </div>
    </div>
  );
}
