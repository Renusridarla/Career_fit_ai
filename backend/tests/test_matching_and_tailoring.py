import pytest
from app.schemas.resume import ParsedResumeData, PersonalInfo, SkillsCategorized, ProjectItem, ExperienceItem
from app.schemas.job import JobRequirements
from app.services.skill_normalizer import normalize_skill, normalize_skill_list
from app.services.matching_engine import calculate_match_scores
from app.services.gap_analyzer import analyze_skill_gaps
from app.services.resume_tailor import tailor_resume_heuristically

def test_skill_normalization():
    assert normalize_skill("js") == "JavaScript"
    assert normalize_skill("Node.js") == "Node.js"
    assert normalize_skill("mongo") == "MongoDB"
    assert normalize_skill("postgres") == "PostgreSQL"

    raw_list = ["js", "ReactJS", "mongo", "javascript"]
    normalized = normalize_skill_list(raw_list)
    assert "JavaScript" in normalized
    assert "React" in normalized
    assert "MongoDB" in normalized
    assert len(normalized) == 3  # Duplicate JS removed

def test_matching_engine_exact_and_missing():
    resume = ParsedResumeData(
        summary="Experienced Python and React developer.",
        personal=PersonalInfo(name="Test Candidate", email="test@example.com"),
        skills=SkillsCategorized(
            programming_languages=["Python", "JavaScript"],
            frontend=["React"],
            backend=["FastAPI"],
            databases=["MongoDB"]
        ),
        projects=[ProjectItem(name="Test Project", description="React and FastAPI app.", technologies=["React", "FastAPI"])],
        experience=[]
    )

    job = JobRequirements(
        required_skills=["React", "Python", "FastAPI"],
        preferred_skills=["AWS", "Docker"]
    )

    overall_score, cat_scores, matched, partial, missing, evidence = calculate_match_scores(resume, job)

    assert "React" in matched
    assert "Python" in matched
    assert "FastAPI" in matched
    assert "AWS" in missing
    assert "Docker" in missing

    assert overall_score > 60.0
    assert cat_scores.technical_skills > 50.0

def test_anti_fabrication_tailoring():
    """
    STRICT ANTI-FABRICATION TEST:
    Verify that missing skills (e.g. AWS, Docker) are NEVER inserted into the tailored resume!
    """
    original_resume = ParsedResumeData(
        summary="Python developer.",
        personal=PersonalInfo(name="Alex Student"),
        skills=SkillsCategorized(
            programming_languages=["Python", "JavaScript"],
            frontend=["React"]
        ),
        projects=[ProjectItem(name="Web App", description="Built with React and Python.", technologies=["React", "Python"])],
        experience=[]
    )

    job = JobRequirements(
        required_skills=["React", "Python"],
        preferred_skills=["AWS", "Docker", "Kubernetes"]
    )

    missing_skills = ["AWS", "Docker", "Kubernetes"]

    tailored_resume, diffs = tailor_resume_heuristically(original_resume, job, missing_skills)

    # Verify AWS, Docker, Kubernetes are NOT added to tailored skills
    tailored_all_skills = [
        s for sublist in [
            tailored_resume.skills.programming_languages,
            tailored_resume.skills.frontend,
            tailored_resume.skills.backend,
            tailored_resume.skills.databases,
            tailored_resume.skills.cloud,
            tailored_resume.skills.tools,
            tailored_resume.skills.frameworks,
            tailored_resume.skills.other
        ] for s in sublist
    ]

    for missing in missing_skills:
        assert missing not in tailored_all_skills, f"VIOLATION: Missing skill '{missing}' was illegally added to resume!"
        assert missing.lower() not in tailored_resume.summary.lower(), f"VIOLATION: Missing skill '{missing}' added to summary!"

def test_learning_roadmap_generation():
    resume = ParsedResumeData(
        skills=SkillsCategorized(programming_languages=["Java"])
    )
    job = JobRequirements(
        required_skills=["Java", "Spring Boot", "AWS"]
    )
    missing = ["Spring Boot", "AWS"]

    roadmap = analyze_skill_gaps(resume, job, missing)
    assert len(roadmap) == 2
    spring_item = next(item for item in roadmap if item.skill == "Spring Boot")
    assert "Java" in spring_item.related_skill
