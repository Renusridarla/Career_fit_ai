import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ReadinessScoreCard from '../components/ReadinessScoreCard';
import DecisionBanner from '../components/DecisionBanner';
import WhyMatchWhyNot from '../components/WhyMatchWhyNot';
import CoverageMatrix from '../components/CoverageMatrix';
import RoleResumeRequirements from '../components/RoleResumeRequirements';
import ProjectRecommenderCard from '../components/ProjectRecommenderCard';
import SkillMatchCard from '../components/SkillMatchCard';
import EvidenceCard from '../components/EvidenceCard';
import SkillGapCard from '../components/SkillGapCard';
import LearningRoadmap from '../components/LearningRoadmap';
import RecommendationCard from '../components/RecommendationCard';
import api from '../services/api';
import { Building, Briefcase, Sparkles, Loader2, AlertCircle } from 'lucide-react';

export default function JobAnalysis() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTailoring, setIsTailoring] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const jobRes = await api.get(`/jobs/${jobId}`);
        setJob(jobRes.data);

        let analysisRes;
        try {
          analysisRes = await api.post(`/analysis/${jobId}`);
        } catch (err) {
          console.error('Post analysis failed, trying get:', err);
        }
        setAnalysis(analysisRes?.data);
      } catch (err) {
        console.error('Failed to load analysis:', err);
        setError(err.response?.data?.detail || 'Failed to load analysis details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysisData();
  }, [jobId]);

  const handleTailorResume = async () => {
    if (!analysis) return;
    setIsTailoring(true);
    try {
      const res = await api.post(`/tailor/${analysis.id}`);
      navigate(`/tailor/${res.data.id}`);
    } catch (err) {
      console.error('Tailor error:', err);
      alert('Failed to generate tailored resume.');
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col text-slate-100">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
              <span>Evaluating Candidate Evidence Graph & Job Readiness...</span>
            </div>
          ) : error ? (
            <div className="glass-card p-8 rounded-2xl text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">Analysis Error</h3>
              <p className="text-sm text-slate-400">{error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Job Header */}
              <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                    <Building className="w-4 h-4" /> {job?.company}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {job?.title}
                  </h1>
                </div>

                <button
                  onClick={handleTailorResume}
                  disabled={isTailoring}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2 shrink-0 self-start md:self-auto"
                >
                  {isTailoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isTailoring ? 'Tailoring Resume...' : 'Tailor My Resume'}
                </button>
              </div>

              {/* 1. Career Decision Banner (APPLY NOW vs PREPARE FIRST) */}
              {analysis && (
                <DecisionBanner
                  decision={analysis.decision}
                  rationale={analysis.decision_rationale}
                  prepTimeEstimate={analysis.prep_time_estimate}
                  topBlockers={analysis.top_blockers}
                  onTailorClick={handleTailorResume}
                />
              )}

              {/* 2. Dual Scores (ATS Compatibility Score vs Job Readiness Score) */}
              {analysis && (
                <ReadinessScoreCard
                  atsScore={analysis.ats_score}
                  readinessScore={analysis.job_readiness_score}
                />
              )}

              {/* 3. Skill Categorization Cards */}
              {analysis && (
                <SkillMatchCard
                  matchedSkills={analysis.matched_skills}
                  partialMatches={analysis.partial_matches}
                  missingSkills={analysis.missing_skills}
                />
              )}

              {/* 4. Explainable AI Evaluation ("Why Do I Match?" vs "Why Don't I Match?") */}
              {analysis && (
                <WhyMatchWhyNot
                  whyMatch={analysis.why_match}
                  whyNotMatch={analysis.why_not_match}
                />
              )}

              {/* 5. What to Include in Your Resume for This Role */}
              {analysis && (
                <RoleResumeRequirements
                  roleRequirements={analysis.role_resume_requirements}
                  jobTitle={job?.title}
                />
              )}

              {/* 6. Requirement -> Resume Coverage Matrix Table */}
              {analysis && (
                <CoverageMatrix coverageMatrix={analysis.coverage_matrix} />
              )}

              {/* 6. Single Unified Project Recommendation */}
              {analysis && (
                <ProjectRecommenderCard projectRecommendation={analysis.project_recommendation} />
              )}

              {/* 7. Actionable AI Recommendations */}
              {analysis && (
                <RecommendationCard
                  recommendations={analysis.recommendations}
                  onTailorClick={handleTailorResume}
                  isTailoring={isTailoring}
                />
              )}

              {/* 8. Skill Gap Analysis & Personal Learning Roadmap */}
              {analysis && (
                <LearningRoadmap learningPlan={analysis.learning_plan} />
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
