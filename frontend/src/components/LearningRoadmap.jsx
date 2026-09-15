import React from 'react';
import { Compass, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LearningRoadmap({ learningPlan }) {
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Skills to Learn Roadmap</h3>
          <p className="text-xs text-slate-400">
            Personalized learning paths designed around your existing skills.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {learningPlan && learningPlan.length > 0 ? (
          learningPlan.map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    {item.skill}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target Skill Goal ({item.importance})
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Actionable Steps:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {item.learning_steps?.map((step, sidx) => (
                    <div key={sidx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {sidx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 italic">No learning roadmap items required for this role.</p>
        )}
      </div>
    </div>
  );
}
