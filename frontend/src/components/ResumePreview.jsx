import React, { useState } from 'react';
import { Download, FileText, Save, ShieldCheck, Code, Copy, Check, Eye, RotateCcw } from 'lucide-react';
import api from '../services/api';

function escapeLaTeX(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

function generateClientLaTeX(data) {
  if (!data) return '% No resume data available.';
  const p = data.personal || {};
  const s = data.skills || {};

  const name = escapeLaTeX(p.name || 'Candidate Name');
  const contacts = [
    p.email ? `\\href{mailto:${p.email}}{${escapeLaTeX(p.email)}}` : null,
    p.phone ? escapeLaTeX(p.phone) : null,
    p.location ? escapeLaTeX(p.location) : null,
    p.linkedin ? `\\href{${p.linkedin.startsWith('http') ? p.linkedin : 'https://' + p.linkedin}}{LinkedIn}` : null,
    p.github ? `\\href{${p.github.startsWith('http') ? p.github : 'https://' + p.github}}{GitHub}` : null,
    p.portfolio ? `\\href{${p.portfolio.startsWith('http') ? p.portfolio : 'https://' + p.portfolio}}{Portfolio}` : null,
  ].filter(Boolean).join(' \\ | \\ ');

  const lines = [
    '\\documentclass[11pt,a4paper]{article}',
    '\\usepackage[utf8]{inputenc}',
    '\\usepackage[margin=0.6in]{geometry}',
    '\\usepackage{hyperref}',
    '\\usepackage{enumitem}',
    '\\usepackage{titlesec}',
    '\\usepackage{xcolor}',
    '',
    '\\hypersetup{colorlinks=true, linkcolor=blue, urlcolor=blue}',
    '\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0pt}{}[\\titlerule]',
    '\\titlespacing*{\\section}{0pt}{10pt}{4pt}',
    '\\pagestyle{empty}',
    '',
    '\\begin{document}',
    '',
    '% --- HEADER ---',
    '\\begin{center}',
    `    {\\LARGE \\textbf{${name}}}\\\\[4pt]`,
    `    \\small ${contacts}`,
    '\\end{center}',
    '\\vspace{-4pt}'
  ];

  if (data.summary) {
    lines.push('', '% --- PROFESSIONAL SUMMARY ---', '\\section*{Professional Summary}', escapeLaTeX(data.summary));
  }

  const skillRows = [];
  if (s.programming_languages?.length > 0) skillRows.push(`\\textbf{Languages:} ${escapeLaTeX(s.programming_languages.join(', '))}`);
  if (s.frontend?.length > 0) skillRows.push(`\\textbf{Frontend:} ${escapeLaTeX(s.frontend.join(', '))}`);
  if (s.backend?.length > 0) skillRows.push(`\\textbf{Backend:} ${escapeLaTeX(s.backend.join(', '))}`);
  if (s.databases?.length > 0) skillRows.push(`\\textbf{Databases:} ${escapeLaTeX(s.databases.join(', '))}`);
  if (s.cloud?.length > 0) skillRows.push(`\\textbf{Cloud/DevOps:} ${escapeLaTeX(s.cloud.join(', '))}`);
  if (s.tools?.length > 0) skillRows.push(`\\textbf{Tools:} ${escapeLaTeX(s.tools.join(', '))}`);
  if (s.frameworks?.length > 0) skillRows.push(`\\textbf{Frameworks:} ${escapeLaTeX(s.frameworks.join(', '))}`);
  if (s.other?.length > 0) skillRows.push(`\\textbf{Other:} ${escapeLaTeX(s.other.join(', '))}`);

  if (skillRows.length > 0) {
    lines.push('', '% --- TECHNICAL SKILLS ---', '\\section*{Technical Skills}', '\\begin{itemize}[leftmargin=0.15in, label={}, itemsep=2pt]');
    skillRows.forEach(sr => lines.push(`    \\item ${sr}`));
    lines.push('\\end{itemize}');
  }

  if (data.experience?.length > 0) {
    lines.push('', '% --- WORK EXPERIENCE ---', '\\section*{Work Experience}');
    data.experience.forEach(exp => {
      lines.push(`\\textbf{${escapeLaTeX(exp.role)}} --- \\textbf{${escapeLaTeX(exp.company)}} \\hfill \\textit{${escapeLaTeX(exp.dates || '')}}\\\\`);
      const bullets = [...(exp.responsibilities || []), ...(exp.achievements || []).map(a => `\\textbf{Achievement:} ${a}`)];
      if (bullets.length > 0) {
        lines.push('\\begin{itemize}[leftmargin=0.25in, topsep=2pt, itemsep=2pt]');
        bullets.forEach(b => lines.push(`    \\item ${escapeLaTeX(b)}`));
        lines.push('\\end{itemize}');
      }
      lines.push('\\vspace{4pt}');
    });
  }

  if (data.projects?.length > 0) {
    lines.push('', '% --- KEY PROJECTS ---', '\\section*{Key Projects}');
    data.projects.forEach(proj => {
      const techStr = proj.technologies?.length > 0 ? ` --- \\textit{${escapeLaTeX(proj.technologies.join(', '))}}` : '';
      lines.push(`\\textbf{${escapeLaTeX(proj.name)}}${techStr}\\\\`);
      const bullets = [proj.description, ...(proj.achievements || [])].filter(Boolean);
      if (bullets.length > 0) {
        lines.push('\\begin{itemize}[leftmargin=0.25in, topsep=2pt, itemsep=2pt]');
        bullets.forEach(b => lines.push(`    \\item ${escapeLaTeX(b)}`));
        lines.push('\\end{itemize}');
      }
      lines.push('\\vspace{4pt}');
    });
  }

  if (data.education?.length > 0) {
    lines.push('', '% --- EDUCATION ---', '\\section*{Education}');
    data.education.forEach(edu => {
      const gpaStr = edu.cgpa ? ` \\ | \\ CGPA: ${escapeLaTeX(edu.cgpa)}` : '';
      lines.push(`\\textbf{${escapeLaTeX(edu.degree)} in ${escapeLaTeX(edu.field)}} \\hfill \\textit{${escapeLaTeX(edu.graduation_year || '')}}\\\\`);
      lines.push(`${escapeLaTeX(edu.institution)}${gpaStr}\\\\`);
      lines.push('\\vspace{2pt}');
    });
  }

  if (data.certifications?.length > 0) {
    lines.push('', '% --- CERTIFICATIONS ---', '\\section*{Certifications}', '\\begin{itemize}[leftmargin=0.25in, topsep=2pt, itemsep=2pt]');
    data.certifications.forEach(cert => lines.push(`    \\item ${escapeLaTeX(cert)}`));
    lines.push('\\end{itemize}');
  }

  if (data.achievements?.length > 0) {
    lines.push('', '% --- HONORS \\& ACHIEVEMENTS ---', '\\section*{Honors \\& Achievements}', '\\begin{itemize}[leftmargin=0.25in, topsep=2pt, itemsep=2pt]');
    data.achievements.forEach(ach => lines.push(`    \\item ${escapeLaTeX(ach)}`));
    lines.push('\\end{itemize}');
  }

  lines.push('', '\\end{document}');
  return lines.join('\n');
}

export default function ResumePreview({ tailoredId, resumeData, latexCode, onUpdate }) {
  const [data, setData] = useState(resumeData);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('visual'); // 'visual' | 'latex'
  const [copied, setCopied] = useState(false);
  const [editableLaTeX, setEditableLaTeX] = useState(null);

  const currentLaTeX = editableLaTeX !== null ? editableLaTeX : (latexCode || generateClientLaTeX(data));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/tailor/${tailoredId}`, { resume_data: data });
      if (onUpdate) onUpdate(data);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save edits.');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadFile = async (format, ext) => {
    try {
      const response = await api.get(`/export/${tailoredId}/${format}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Tailored_Resume_${tailoredId}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Download ${format} failed:`, err);
      if (format === 'latex' && currentLaTeX) {
        const blob = new Blob([currentLaTeX], { type: 'text/x-tex' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Tailored_Resume_${tailoredId}.tex`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert(`Failed to download ${format.toUpperCase()} file.`);
      }
    }
  };

  const handleDownloadPDF = () => downloadFile('pdf', 'pdf');
  const handleDownloadDOCX = () => downloadFile('docx', 'docx');
  const handleDownloadLaTeX = () => {
    if (editableLaTeX !== null && currentLaTeX) {
      const blob = new Blob([currentLaTeX], { type: 'text/x-tex' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Tailored_Resume_${tailoredId}.tex`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } else {
      downloadFile('latex', 'tex');
    }
  };

  const handleCopyLaTeX = () => {
    if (currentLaTeX) {
      navigator.clipboard.writeText(currentLaTeX);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const p = data.personal || {};
  const s = data.skills || {};

  return (
    <div className="space-y-6">
      
      {/* Export & View Control Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Full Tailored Master Resume</h3>
            <p className="text-xs text-slate-400">Total Profile Tailored with 100% Truth-Preserving ATS Optimization</p>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'visual'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Visual Resume
          </button>
          <button
            onClick={() => setActiveTab('latex')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'latex'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> LaTeX Code
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Edits'}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            PDF
          </button>
          <button
            onClick={handleDownloadDOCX}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            DOCX
          </button>
          <button
            onClick={handleDownloadLaTeX}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-600/20 transition-all"
          >
            <Code className="w-3.5 h-3.5" />
            .TEX
          </button>
        </div>
      </div>

      {/* Main Container View: Visual Sheet vs LaTeX Code */}
      {activeTab === 'visual' ? (
        /* Styled Total Resume Preview Sheet */
        <div className="bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl max-w-4xl mx-auto space-y-6 text-sm font-sans border border-slate-200">
          
          {/* Resume Header */}
          <div className="text-center border-b border-slate-200 pb-4">
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{p.name || 'Candidate Name'}</h1>
            <p className="text-xs text-slate-600 mt-1 space-x-2">
              {[p.email, p.phone, p.location, p.linkedin, p.github, p.portfolio].filter(Boolean).join(' | ')}
            </p>
          </div>

          {/* Summary */}
          {data.summary && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Skills */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Technical Skills
            </h2>
            <div className="text-xs text-slate-700 space-y-1">
              {s.programming_languages?.length > 0 && <div><strong>Languages:</strong> {s.programming_languages.join(', ')}</div>}
              {s.frontend?.length > 0 && <div><strong>Frontend:</strong> {s.frontend.join(', ')}</div>}
              {s.backend?.length > 0 && <div><strong>Backend:</strong> {s.backend.join(', ')}</div>}
              {s.databases?.length > 0 && <div><strong>Databases:</strong> {s.databases.join(', ')}</div>}
              {s.cloud?.length > 0 && <div><strong>Cloud:</strong> {s.cloud.join(', ')}</div>}
              {s.tools?.length > 0 && <div><strong>Tools:</strong> {s.tools.join(', ')}</div>}
              {s.frameworks?.length > 0 && <div><strong>Frameworks:</strong> {s.frameworks.join(', ')}</div>}
              {s.other?.length > 0 && <div><strong>Other:</strong> {s.other.join(', ')}</div>}
            </div>
          </div>

          {/* Experience */}
          {data.experience?.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Work Experience
              </h2>
              <div className="space-y-3">
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-900">
                      <span>{exp.role} — {exp.company}</span>
                      <span className="font-normal text-slate-500">{exp.dates}</span>
                    </div>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5">
                      {exp.responsibilities?.map((r, ridx) => <li key={ridx}>{r}</li>)}
                      {exp.achievements?.map((a, aidx) => <li key={aidx}><strong>Achievement:</strong> {a}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {data.projects?.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Key Projects
              </h2>
              <div className="space-y-3">
                {data.projects.map((proj, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-xs font-bold text-slate-900">
                      {proj.name} <span className="font-normal italic text-slate-600">({proj.technologies?.join(', ')})</span>
                    </div>
                    {proj.description && <p className="text-xs text-slate-700">• {proj.description}</p>}
                    {proj.achievements?.map((a, aidx) => (
                      <p key={aidx} className="text-xs text-slate-700">• {a}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education?.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Education
              </h2>
              <div className="space-y-1 text-xs text-slate-700">
                {data.education.map((edu, idx) => (
                  <div key={idx}>
                    <strong>{edu.degree} in {edu.field}</strong> — {edu.institution} ({edu.graduation_year}) {edu.cgpa ? `| CGPA: ${edu.cgpa}` : ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {data.certifications?.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Certifications
              </h2>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5">
                {data.certifications.map((cert, idx) => (
                  <li key={idx}>{cert}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Achievements */}
          {data.achievements?.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Honors & Achievements
              </h2>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5">
                {data.achievements.map((ach, idx) => (
                  <li key={idx}>{ach}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      ) : (
        /* Interactive Overleaf-Ready LaTeX Code Editor View */
        <div className="glass-card rounded-2xl p-6 space-y-4 bg-slate-950 border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Code className="w-4 h-4 text-teal-400" />
              <span>Interactive Overleaf-Ready LaTeX Code (.tex)</span>
              {editableLaTeX !== null && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                  Custom Edited
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {editableLaTeX !== null && (
                <button
                  onClick={() => setEditableLaTeX(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Original
                </button>
              )}
              <button
                onClick={handleCopyLaTeX}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            You can directly edit the LaTeX source code below to customize packages, section titles, spacing, or bullet formatting. Your edited code will be used when copying or downloading the <code className="text-teal-400">.tex</code> file.
          </p>

          <textarea
            value={currentLaTeX}
            onChange={(e) => setEditableLaTeX(e.target.value)}
            spellCheck={false}
            className="w-full h-[550px] p-4 rounded-xl bg-slate-900 border border-slate-800 text-teal-300 text-xs font-mono leading-relaxed focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 resize-y"
          />
        </div>
      )}

    </div>
  );
}
