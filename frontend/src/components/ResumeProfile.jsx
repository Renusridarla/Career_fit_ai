import React, { useState } from 'react';
import { User, GraduationCap, Code, Briefcase, FolderGit2, Award, Save, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function ResumeProfile({ resume, onUpdate, onDelete }) {
  const [data, setData] = useState(resume.parsed_data);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.put(`/resumes/${resume.id}`, { parsed_data: data });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onUpdate) onUpdate(res.data);
    } catch (err) {
      console.error('Failed to update resume:', err);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePersonalChange = (field, value) => {
    setData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">Parsed Master Resume</h2>
          <p className="text-xs text-slate-400">File: {resume.original_filename}</p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Master Resume"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Personal Info */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 text-blue-400 font-semibold mb-4">
          <User className="w-5 h-5" /> Personal Information
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Full Name</label>
            <input
              type="text"
              value={data.personal?.name || ''}
              onChange={(e) => handlePersonalChange('name', e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Email</label>
            <input
              type="email"
              value={data.personal?.email || ''}
              onChange={(e) => handlePersonalChange('email', e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Phone</label>
            <input
              type="text"
              value={data.personal?.phone || ''}
              onChange={(e) => handlePersonalChange('phone', e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">LinkedIn</label>
            <input
              type="text"
              value={data.personal?.linkedin || ''}
              onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">GitHub</label>
            <input
              type="text"
              value={data.personal?.github || ''}
              onChange={(e) => handlePersonalChange('github', e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-4">
          <Code className="w-5 h-5" /> Technical Skills
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data.skills || {}).map(([key, list]) => (
            <div key={key} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                {key.replace('_', ' ')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(list) && list.length > 0 ? (
                  list.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">None listed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-4">
          <FolderGit2 className="w-5 h-5" /> Key Projects
        </div>
        <div className="space-y-4">
          {data.projects && data.projects.length > 0 ? (
            data.projects.map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{p.name}</h4>
                  <div className="flex flex-wrap gap-1">
                    {p.technologies?.map((t, tidx) => (
                      <span key={tidx} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-300">{p.description}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No projects extracted.</p>
          )}
        </div>
      </div>

      {/* Work Experience */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 text-amber-400 font-semibold mb-4">
          <Briefcase className="w-5 h-5" /> Experience
        </div>
        <div className="space-y-4">
          {data.experience && data.experience.length > 0 ? (
            data.experience.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                    <p className="text-xs text-slate-400">{exp.company}</p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{exp.dates}</span>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {exp.responsibilities?.map((r, ridx) => (
                    <li key={ridx} className="text-xs text-slate-300">{r}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No work experience extracted.</p>
          )}
        </div>
      </div>

    </div>
  );
}
