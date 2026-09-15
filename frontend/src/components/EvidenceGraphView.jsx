import React from 'react';
import { GitFork, Layers, CheckCircle2, Award, Briefcase, FolderGit2 } from 'lucide-react';

export default function EvidenceGraphView({ parsedData }) {
  if (!parsedData || !parsedData.skills) return null;

  const getLevelBadge = (hasProjects, hasExp) => {
    if (hasExp) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Level 4: Professional Proof</span>;
    if (hasProjects) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Level 2–3: Project Proof</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">Level 1: Mentioned</span>;
  };

  const allSkills = [
    ...(parsedData.skills.programming_languages || []),
    ...(parsedData.skills.frontend || []),
    ...(parsedData.skills.backend || []),
    ...(parsedData.skills.databases || []),
    ...(parsedData.skills.cloud || []),
    ...(parsedData.skills.tools || [])
  ];

  const projects = parsedData.projects || [];
  const experience = parsedData.experience || [];

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <GitFork className="w-5 h-5 text-blue-400" /> Candidate Evidence Graph
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Structured graph visualization linking skills to candidate project proof, work experience, and evidence snippets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allSkills.map((skill, idx) => {
          const matchingProjects = projects.filter(p => 
            p.technologies?.some(t => t.lower === skill.lower || t.toLowerCase() === skill.toLowerCase()) ||
            p.description?.toLowerCase().includes(skill.toLowerCase())
          );
          const matchingExp = experience.filter(e =>
            e.responsibilities?.some(r => r.toLowerCase().includes(skill.toLowerCase())) ||
            e.company?.toLowerCase().includes(skill.toLowerCase())
          );

          const hasProj = matchingProjects.length > 0;
          const hasExp = matchingExp.length > 0;

          return (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{skill}</span>
                {getLevelBadge(hasProj, hasExp)}
              </div>

              {/* Connected Evidence Nodes */}
              <div className="space-y-1.5 pt-1">
                {hasExp && (
                  <div className="text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Experience at {matchingExp[0].company}</span>
                  </div>
                )}
                {hasProj && matchingProjects.map((p, pidx) => (
                  <div key={pidx} className="text-xs text-indigo-300 flex items-center gap-1.5 font-medium">
                    <FolderGit2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Project: {p.name}</span>
                  </div>
                ))}
                {!hasProj && !hasExp && (
                  <div className="text-[11px] text-slate-500 italic">
                    Listed in skills section
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
