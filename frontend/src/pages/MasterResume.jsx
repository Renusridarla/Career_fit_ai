import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ResumeUploader from '../components/ResumeUploader';
import ResumeProfile from '../components/ResumeProfile';
import EvidenceGraphView from '../components/EvidenceGraphView';
import api from '../services/api';
import { Loader2 } from 'lucide-react';

export default function MasterResume() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchResume = async () => {
    try {
      const res = await api.get('/resumes');
      setResume(res.data);
    } catch (err) {
      console.error('Failed to fetch resume:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleUploadSuccess = (updatedResume) => {
    setResume(updatedResume);
  };

  const handleDeleteResume = async () => {
    if (!resume) return;
    if (window.confirm('Are you sure you want to delete your Master Resume?')) {
      try {
        await api.delete(`/resumes/${resume.id}`);
        setResume(null);
      } catch (err) {
        console.error('Failed to delete:', err);
        alert('Failed to delete resume.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col text-slate-100">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Master Candidate Profile</h1>
            <p className="text-sm text-slate-400 mt-1">
              Persistent source-of-truth profile powering your Candidate Evidence Graph and job readiness scores.
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <span>Loading candidate evidence graph...</span>
            </div>
          ) : resume ? (
            <div className="space-y-8">
              
              {/* Candidate Evidence Graph Visualization */}
              <EvidenceGraphView parsedData={resume.parsed_data} />

              {/* Master Profile Inline Editor */}
              <ResumeProfile
                resume={resume}
                onUpdate={setResume}
                onDelete={handleDeleteResume}
              />

              <div className="pt-8 border-t border-slate-800">
                <h3 className="text-base font-bold text-white mb-4">Re-upload Master Resume</h3>
                <ResumeUploader onUploadSuccess={handleUploadSuccess} />
              </div>
            </div>
          ) : (
            <ResumeUploader onUploadSuccess={handleUploadSuccess} />
          )}

        </main>
      </div>
    </div>
  );
}
