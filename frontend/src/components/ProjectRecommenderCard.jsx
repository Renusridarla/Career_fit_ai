import React from 'react';
import { FolderPlus, Layers, CheckCircle2, ListChecks, FileText } from 'lucide-react';

export default function ProjectRecommenderCard({ projectRecommendation }) {
  if (!projectRecommendation || !projectRecommendation.title) return null;

  const rec = projectRecommendation;

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border-indigo-500/30 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <FolderPlus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Recommended Single Multi-Skill Project</h3>
          <p className="text-xs text-slate-400">
            A single recommended project designed to create evidence for multiple missing job requirements simultaneously.
          </p>
        </div>
      </div>

      {/* Project Title & Purpose */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-base font-extrabold text-indigo-300">{rec.title}</h4>
          <div className="flex flex-wrap gap-1">
            {rec.technologies?.map((tech, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">Project Objective:</strong> {rec.objective || rec.purpose}
        </p>

        {/* Covered Requirements */}
        {rec.covered_requirements && rec.covered_requirements.length > 0 && (
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Requirements Addressed in 1 Project:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {rec.covered_requirements.map((req, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {req}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Features & Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Features */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Key Features
          </h5>
          <ul className="space-y-1.5">
            {rec.features?.map((feat, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Milestones */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-emerald-400" /> Step-by-Step Milestones
          </h5>
          <ul className="space-y-1.5">
            {rec.milestones?.map((ms, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{ms}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Resume Evidence Snippet to Add Afterward */}
      {rec.evidence_to_add && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1 text-xs">
          <span className="font-bold text-blue-300 uppercase tracking-wider block flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Resume Bullet to Add Afterward:
          </span>
          <p className="font-mono text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800">
            "{rec.evidence_to_add}"
          </p>
        </div>
      )}
    </div>
  );
}
