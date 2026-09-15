from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional
from datetime import datetime

class CategoryScores(BaseModel):
    technical_skills: float = 0.0
    experience: float = 0.0
    projects: float = 0.0
    education: float = 0.0
    responsibilities: float = 0.0

class EvidenceItem(BaseModel):
    requirement: str
    category: str  # STRONG MATCH, PARTIAL MATCH, MISSING
    priority: str = "REQUIRED"
    evidence_text: str = ""
    source_section: str = ""

class LearningRoadmapItem(BaseModel):
    skill: str
    importance: str
    reason: str
    related_skill: str = "None"
    recommendation: str
    learning_steps: List[str] = Field(default_factory=list)

class AnalysisResponse(BaseModel):
    id: str
    user_id: str
    resume_id: str
    job_id: str
    job_title: str = ""
    company: str = ""
    ats_score: float = 0.0
    job_readiness_score: float = 0.0
    overall_score: float = 0.0
    decision: str = "PREPARE FIRST"  # APPLY NOW or PREPARE FIRST
    decision_rationale: str = ""
    prep_time_estimate: str = ""
    category_scores: CategoryScores
    matched_skills: List[str] = Field(default_factory=list)
    partial_matches: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    top_blockers: List[str] = Field(default_factory=list)
    why_match: List[Dict[str, Any]] = Field(default_factory=list)
    why_not_match: List[Dict[str, Any]] = Field(default_factory=list)
    coverage_matrix: List[Dict[str, Any]] = Field(default_factory=list)
    project_recommendation: Dict[str, Any] = Field(default_factory=dict)
    role_resume_requirements: Dict[str, Any] = Field(default_factory=dict)
    evidence: List[EvidenceItem] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    learning_plan: List[LearningRoadmapItem] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
