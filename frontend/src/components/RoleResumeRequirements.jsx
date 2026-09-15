import React from 'react';
import { FileText, CheckCircle2, AlertTriangle, Sparkles, Layers, ListChecks, ArrowRight } from 'lucide-react';

export default function RoleResumeRequirements({ roleRequirements, jobTitle }) {
  if (!roleRequirements || Object.keys(roleRequirements).length === 0) return null;

  const {
    summary_positioning,
    core_skills_checklist = [],
    sample_action_bullets = [],
    domain_keywords = [],
    section_checklist = []
  } = roleRequirements;

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              What to Include in Your Resume for {jobTitle || 'This Role'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Role-specific blueprint detailing core skills, section layout, and high-impact bullet points.
            </p>
          </div>
        </div>

        <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Tailoring Checklist
        </span>
      </div>

      {/* Positioning Callout */}
      {summary_positioning && (
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/50 text-slate-200 text-sm flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-300">Strategic Positioning Guide: </span>
            <span>{summary_positioning}</span>
          </div>
        </div>
      )}

      {/* Section-by-Section Layout Blueprint */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-blue-400" /> Section-by-Section Resume Blueprint
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {section_checklist.map((sec, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5 hover:border-slate-700 transition-colors">
              <span className="text-xs font-bold text-blue-400 block">{sec.section}</span>
              <p className="text-xs text-slate-300 leading-relaxed">{sec.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Core Skills Checklist */}
      {core_skills_checklist.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" /> Essential Role Skills Checklist
          </h3>

          <div className="flex flex-wrap gap-2">
            {core_skills_checklist.map((item, idx) => {
              const inResume = item.status === 'In Resume';
              return (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                    inResume
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                      : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
                  }`}
                >
                  {inResume ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span>{item.skill}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    inResume ? 'bg-emerald-900/60 text-emerald-200' : 'bg-amber-900/60 text-amber-200'
                  }`}>
                    {inResume ? 'IN RESUME' : 'ADD TO RESUME'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sample High-Impact Bullet Points */}
      {sample_action_bullets.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-indigo-400" /> High-Impact Action Bullets for This Role
          </h3>

          <div className="space-y-2">
            {sample_action_bullets.map((bullet, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5 font-mono">
                <span className="text-blue-400 font-bold">•</span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Essential Domain Keywords */}
      {domain_keywords.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider text-xs">
            Key Domain Terms & ATS Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {domain_keywords.map((kw, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700">
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
