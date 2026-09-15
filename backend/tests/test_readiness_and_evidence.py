import pytest
from app.schemas.resume import ParsedResumeData, PersonalInfo, SkillsCategorized, ProjectItem, ExperienceItem
from app.schemas.job import JobRequirements
from app.services.evidence_engine import build_candidate_evidence_graph, evaluate_skill_evidence_level, EvidenceLevel
from app.services.readiness_engine import evaluate_job_readiness
from app.services.project_recommender import recommend_unified_project
from app.services.integrity_checker import audit_resume_integrity

def test_evidence_graph_and_levels():
    resume = ParsedResumeData(
        skills=SkillsCategorized(
            programming_languages=["Python", "JavaScript"],
            frontend=["React"]
        ),
        projects=[
            ProjectItem(name="Portal", description="Built frontend using React and Node.js.", technologies=["React", "Node.js"])
        ],
        experience=[
            ExperienceItem(company="Tech Corp", role="Intern", responsibilities=["Wrote Python scripts and backend APIs."])
        ]
    )

    graph = build_candidate_evidence_graph(resume)

    # React used in 1 project -> Level 2 (Project Evidence)
    level_react, _, _ = evaluate_skill_evidence_level("React", graph)
    assert level_react == EvidenceLevel.LEVEL_2_PROJECT_EVIDENCE

    # Python used in experience -> Level 4 (Professional Evidence)
    level_py, _, _ = evaluate_skill_evidence_level("Python", graph)
    assert level_py == EvidenceLevel.LEVEL_4_PROFESSIONAL

    # JavaScript mentioned in skills only -> Level 1 (Mentioned)
    level_js, _, _ = evaluate_skill_evidence_level("JavaScript", graph)
    assert level_js == EvidenceLevel.LEVEL_1_MENTIONED

    # Docker missing completely -> Level 0 (No Evidence)
    level_docker, _, _ = evaluate_skill_evidence_level("Docker", graph)
    assert level_docker == EvidenceLevel.LEVEL_0_NO_EVIDENCE

def test_readiness_and_decision_engine():
    resume = ParsedResumeData(
        skills=SkillsCategorized(programming_languages=["Python", "JavaScript"], frontend=["React"])
    )
    job = JobRequirements(
        required_skills=["React", "Python", "Docker", "AWS"],
        preferred_skills=["MongoDB"]
    )

    readiness_res = evaluate_job_readiness(resume, job)

    assert "ats_score" in readiness_res
    assert "job_readiness_score" in readiness_res
    assert readiness_res["decision"] == "PREPARE FIRST"
    assert "Docker" in readiness_res["top_blockers"]

def test_project_recommender():
    resume = ParsedResumeData(
        skills=SkillsCategorized(programming_languages=["Java"])
    )
    job = JobRequirements(
        required_skills=["Java", "Spring Boot", "Docker", "AWS"]
    )
    missing = ["Spring Boot", "Docker", "AWS"]

    rec = recommend_unified_project(resume, job, missing)

    assert "title" in rec
    assert len(rec["covered_requirements"]) > 0

def test_integrity_checker():
    original = ParsedResumeData(
        skills=SkillsCategorized(programming_languages=["Python"])
    )
    tailored = ParsedResumeData(
        skills=SkillsCategorized(programming_languages=["Python", "AWS"]) # AWS missing
    )

    score, audit = audit_resume_integrity(original, tailored, missing_skills=["AWS"])
    assert score < 100.0
    blocked_items = [a for a in audit if a["status"] == "BLOCKED CLAIM"]
    assert len(blocked_items) > 0
