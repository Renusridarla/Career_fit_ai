import logging
from typing import List, Dict, Set, Tuple
from app.schemas.resume import ParsedResumeData
from app.schemas.job import JobRequirements
from app.schemas.analysis import CategoryScores, EvidenceItem
from app.services.skill_normalizer import normalize_skill, normalize_skill_list, is_skill_match
from app.services.embedding_service import calculate_text_similarity

logger = logging.getLogger(__name__)

def extract_all_resume_skills(resume: ParsedResumeData) -> List[str]:
    skills = []
    s = resume.skills
    skills.extend(s.programming_languages)
    skills.extend(s.frontend)
    skills.extend(s.backend)
    skills.extend(s.databases)
    skills.extend(s.cloud)
    skills.extend(s.tools)
    skills.extend(s.frameworks)
    skills.extend(s.other)
    
    # Also extract technologies mentioned in projects
    for proj in resume.projects:
        skills.extend(proj.technologies)
        
    return normalize_skill_list(skills)

def match_requirement(req: str, resume: ParsedResumeData, all_skills: List[str]) -> Tuple[str, str, str]:
    """
    3-Layer Matching Logic:
    1. Layer 1 - Exact / Normalized Keyword Match
    2. Layer 2 - Semantic Similarity in Projects & Experience
    3. Layer 3 - Related Skill / Partial Match Verification
    
    Returns: (Status: 'STRONG MATCH'|'PARTIAL MATCH'|'MISSING', EvidenceText, SourceSection)
    """
    norm_req = normalize_skill(req)
    norm_req_lower = norm_req.lower()

    # Layer 1: Check normalized skill list
    for user_skill in all_skills:
        if is_skill_match(norm_req, user_skill):
            # Check where it appears
            sources = []
            if any(is_skill_match(norm_req, s) for s in all_skills):
                sources.append("Skills section")
            for proj in resume.projects:
                if any(is_skill_match(norm_req, t) for t in proj.technologies) or norm_req_lower in proj.description.lower():
                    sources.append(f"Project '{proj.name}'")
            for exp in resume.experience:
                if norm_req_lower in " ".join(exp.responsibilities).lower():
                    sources.append(f"Experience at '{exp.company}'")
            
            source_str = ", ".join(sources[:2]) if sources else "Skills section"
            return ("STRONG MATCH", f"Explicitly listed in {source_str}", sources[0] if sources else "Skills")

    # Layer 2: Semantic check in project & experience text
    highest_sim = 0.0
    best_source = ""
    best_text = ""

    for proj in resume.projects:
        full_proj_text = f"{proj.name} {proj.description} {' '.join(proj.achievements)}"
        sim = calculate_text_similarity(norm_req, full_proj_text)
        if sim > highest_sim:
            highest_sim = sim
            best_source = f"Project '{proj.name}'"
            best_text = proj.description

    for exp in resume.experience:
        full_exp_text = f"{exp.company} {exp.role} {' '.join(exp.responsibilities)}"
        sim = calculate_text_similarity(norm_req, full_exp_text)
        if sim > highest_sim:
            highest_sim = sim
            best_source = f"Experience at '{exp.company}'"
            best_text = " ".join(exp.responsibilities)

    if highest_sim >= 0.45:
        return ("STRONG MATCH", f"Demonstrated in {best_source}: '{best_text[:80]}...'", best_source)
    elif highest_sim >= 0.25:
        return ("PARTIAL MATCH", f"Related concepts demonstrated in {best_source}", best_source)

    # Layer 3: Partial alias / technology family match
    # E.g., JavaScript -> Node.js, SQL -> PostgreSQL
    related_mappings = {
        "react": ["javascript", "frontend", "html", "css"],
        "fastapi": ["python", "rest apis", "flask", "django"],
        "mongodb": ["nosql", "databases", "json"],
        "postgresql": ["sql", "databases", "mysql"],
        "aws": ["cloud", "docker", "gcp"],
        "docker": ["containers", "devops", "kubernetes"]
    }

    if norm_req_lower in related_mappings:
        for rel in related_mappings[norm_req_lower]:
            for user_skill in all_skills:
                if rel in user_skill.lower():
                    return ("PARTIAL MATCH", f"Has related background in {user_skill}", "Skills")

    return ("MISSING", "No direct or partial evidence found in candidate profile", "None")

def calculate_match_scores(
    resume: ParsedResumeData, 
    job: JobRequirements
) -> Tuple[float, CategoryScores, List[str], List[str], List[str], List[EvidenceItem]]:

    all_user_skills = extract_all_resume_skills(resume)
    
    # Combine requirements
    all_requirements = []
    for s in job.required_skills:
        all_requirements.append((s, "REQUIRED"))
    for s in job.preferred_skills:
        all_requirements.append((s, "PREFERRED"))

    if not all_requirements:
        # Fallback if no skills parsed
        all_requirements = [(s, "REQUIRED") for s in job.programming_languages + job.frameworks + job.tools]

    matched_skills = []
    partial_matches = []
    missing_skills = []
    evidence_items = []

    req_score_points = 0.0
    total_req_points = 0.0

    for req, priority in all_requirements:
        weight = 1.0 if priority == "REQUIRED" else 0.5
        total_req_points += weight

        status, evidence_text, source_sec = match_requirement(req, resume, all_user_skills)
        
        if status == "STRONG MATCH":
            matched_skills.append(req)
            req_score_points += weight * 1.0
        elif status == "PARTIAL MATCH":
            partial_matches.append(req)
            req_score_points += weight * 0.5
        else:
            missing_skills.append(req)
            req_score_points += weight * 0.0

        evidence_items.append(EvidenceItem(
            requirement=req,
            category=status,
            priority=priority,
            evidence_text=evidence_text,
            source_section=source_sec
        ))

    # Category Scores (0 to 100)
    tech_score = (req_score_points / total_req_points * 100.0) if total_req_points > 0 else 70.0
    
    # Experience score
    exp_score = 100.0 if len(resume.experience) >= 2 else (75.0 if len(resume.experience) == 1 else 50.0)
    
    # Projects score
    proj_score = 100.0 if len(resume.projects) >= 2 else (70.0 if len(resume.projects) == 1 else 40.0)
    
    # Education score
    edu_score = 100.0 if len(resume.education) > 0 else 60.0
    
    # Responsibilities score
    resp_score = (tech_score * 0.5 + exp_score * 0.3 + proj_score * 0.2)

    category_scores = CategoryScores(
        technical_skills=round(tech_score, 1),
        experience=round(exp_score, 1),
        projects=round(proj_score, 1),
        education=round(edu_score, 1),
        responsibilities=round(resp_score, 1)
    )

    # Weighted Overall Score Calculation
    # Technical Skills 40%, Experience 20%, Projects 15%, Education 10%, Responsibilities 15%
    overall = (
        category_scores.technical_skills * 0.40 +
        category_scores.experience * 0.20 +
        category_scores.projects * 0.15 +
        category_scores.education * 0.10 +
        category_scores.responsibilities * 0.15
    )
    overall_score = round(min(100.0, max(0.0, overall)), 1)

    return (overall_score, category_scores, matched_skills, partial_matches, missing_skills, evidence_items)
