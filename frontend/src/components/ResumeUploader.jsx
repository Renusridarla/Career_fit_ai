import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function ResumeUploader({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split('.').pop().toLowerCase();
      if (ext !== 'pdf' && ext !== 'docx') {
        setError('Only PDF and DOCX files are supported.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadStatus('Uploading resume file...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadStatus('Extracting text content...');
      setTimeout(() => setUploadStatus('Understanding your profile with AI...'), 1200);

      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadStatus('Resume successfully parsed!');
      if (onUploadSuccess) {
        onUploadSuccess(res.data);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to parse resume. Please check file format.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800">
      <h3 className="text-lg font-semibold text-white mb-1">Upload Master Resume</h3>
      <p className="text-sm text-slate-400 mb-6">
        Upload your single Master Resume in PDF or DOCX format.
      </p>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          file ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
        }`}
      >
        <input
          type="file"
          id="resume-file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        
        <label htmlFor="resume-file" className="cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 mb-3">
            <Upload className="w-6 h-6" />
          </div>

          {file ? (
            <div className="flex items-center gap-2 text-white font-medium">
              <FileText className="w-4 h-4 text-blue-400" />
              {file.name} ({Math.round(file.size / 1024)} KB)
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-white mb-1">
                Click to browse or drag & drop your resume
              </p>
              <p className="text-xs text-slate-400">PDF or DOCX (Max 10MB)</p>
            </div>
          )}
        </label>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-rose-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isUploading && (
        <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2.5 text-blue-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
        >
          {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isUploading ? 'Parsing Resume...' : 'Parse & Save Master Resume'}
        </button>
      </div>
    </div>
  );
}
