import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BeforeAfter from '../components/BeforeAfter';
import ResumePreview from '../components/ResumePreview';
import api from '../services/api';
import { Loader2, AlertCircle } from 'lucide-react';

export default function TailoredResume() {
  const { analysisId } = useParams();
  const [tailored, setTailored] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTailoredResume = async () => {
      try {
        let res;
        try {
          res = await api.get(`/tailor/${analysisId}`);
        } catch (err) {
          // If analysisId was passed instead of tailoredId, post to generate
          res = await api.post(`/tailor/${analysisId}`);
        }
        setTailored(res.data);
      } catch (err) {
        console.error('Failed to load tailored resume:', err);
        setError('Could not load tailored resume.');
      } finally {
        setLoading(false);
      }
    };
    fetchTailoredResume();
  }, [analysisId]);

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col text-slate-100">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Truthful Resume Tailoring</h1>
            <p className="text-sm text-slate-400 mt-1">
              Your existing experience optimized for target job relevance — zero fabricated skills.
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
              <span>Optimizing your master resume for the target position...</span>
            </div>
          ) : error ? (
            <div className="glass-card p-8 rounded-2xl text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">Error</h3>
              <p className="text-sm text-slate-400">{error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Before / After Comparison */}
              <BeforeAfter changesMade={tailored?.changes_made} />

              {/* Formatted Resume Preview & Export */}
              <ResumePreview
                tailoredId={tailored?.id}
                resumeData={tailored?.resume_data}
                latexCode={tailored?.latex_code}
                onUpdate={(newResumeData) => setTailored(prev => ({ ...prev, resume_data: newResumeData }))}
              />

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
