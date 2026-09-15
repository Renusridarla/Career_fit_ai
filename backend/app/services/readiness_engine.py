import logging
from typing import Dict, List, Any, Tuple
from app.schemas.resume import ParsedResumeData
from app.schemas.job import JobRequirements
from app.services.evidence_engine import build_candidate_evidence_graph, evaluate_skill_evidence_level, EvidenceLevel

logger = logging.getLogger(__name__)

def evaluate_job_readiness(
    resume: ParsedResumeData,
    job: JobRequirements
) -> Dict[str, Any]:
    """
    Computes ATS Score vs Job Readiness Score, "Why Do I Match?", "Why Don't I Match?",
    and determines APPLY NOW vs PREPARE FIRST.
    """
    graph = build_candidate_evidence_graph(resume)

    must_have_skills = job.required_skills if job.required_skills else job.programming_languages + job.frameworks
    preferred_skills = job.preferred_skills

    must_have_evaluations = []
    must_have_total_weight = 0.0
    must_have_earned_points = 0.0

    blockers = []
    why_match_items = []
    why_not_items = []
    coverage_matrix = []

    # 1. Evaluate Must-Have Requirements
    for req in must_have_skills:
        weight = 1.0
        must_have_total_weight += weight

        level, level_desc, evidence_list = evaluate_skill_evidence_level(req, graph)

        if level >= EvidenceLevel.LEVEL_2_PROJECT_EVIDENCE:
            earned = 1.0
            status = "STRONG MATCH"
        elif level == EvidenceLevel.LEVEL_1_MENTIONED:
            earned = 0.5
            status = "PARTIAL MATCH"
        else:
            earned = 0.0
            status = "MISSING"
            blockers.append(req)

        must_have_earned_points += earned * weight

        # "Why Do I Match?" item
        if level > EvidenceLevel.LEVEL_0_NO_EVIDENCE:
            snippets = [e["snippet"] for e in evidence_list[:2]]
            why_match_items.append({
                "requirement": req,
                "importance": "Must-Have",
                "evidence_level": level,
                "evidence_level_desc": level_desc,
                "evidence_snippets": snippets if snippets else [f"Listed in Skills section"],
                "explanation": f"Supported by {level_desc.lower()}."
            })
        else:
            why_not_items.append({
                "requirement": req,
                "importance": "Must-Have",
                "impact": "High Blocker",
                "reason": f"Required Must-Have skill, but your profile has no project, experience, or skill evidence for '{req}'.",
                "recommendation": f"Learn '{req}' fundamentals and complete one hands-on project."
            })

        coverage_matrix.append({
            "requirement": req,
            "importance": "Must-Have",
            "evidence_level": level,
            "evidence_level_desc": level_desc,
            "match_status": status,
            "evidence_snippets": [e["snippet"] for e in evidence_list[:2]],
            "section": "Projects/Experience" if level >= 2 else ("Skills" if level == 1 else "None")
        })

    # 2. Evaluate Preferred Requirements
    pref_total_weight = 0.0
    pref_earned_points = 0.0

    for req in preferred_skills:
        weight = 0.5
        pref_total_weight += weight

        level, level_desc, evidence_list = evaluate_skill_evidence_level(req, graph)

        if level >= EvidenceLevel.LEVEL_2_PROJECT_EVIDENCE:
            earned = 1.0
            status = "STRONG MATCH"
        elif level == EvidenceLevel.LEVEL_1_MENTIONED:
            earned = 0.5
            status = "PARTIAL MATCH"
        else:
            earned = 0.0
            status = "MISSING"

        pref_earned_points += earned * weight

        if level == EvidenceLevel.LEVEL_0_NO_EVIDENCE:
            why_not_items.append({
                "requirement": req,
                "importance": "Preferred",
                "impact": "Medium Advantage",
                "reason": f"Preferred by job posting, but absent from your candidate evidence graph.",
                "recommendation": f"Add a project implementation incorporating '{req}'."
            })
        else:
            snippets = [e["snippet"] for e in evidence_list[:2]]
            why_match_items.append({
                "requirement": req,
                "importance": "Preferred",
                "evidence_level": level,
                "evidence_level_desc": level_desc,
                "evidence_snippets": snippets if snippets else [f"Listed in Skills section"],
                "explanation": f"Preferred requirement backed by {level_desc.lower()}."
            })

        coverage_matrix.append({
            "requirement": req,
            "importance": "Preferred",
            "evidence_level": level,
            "evidence_level_desc": level_desc,
            "match_status": status,
            "evidence_snippets": [e["snippet"] for e in evidence_list[:2]],
            "section": "Projects/Experience" if level >= 2 else ("Skills" if level == 1 else "None")
        })

    # 3. Compute ATS Score vs Readiness Score
    must_have_pct = (must_have_earned_points / must_have_total_weight * 100.0) if must_have_total_weight > 0 else 70.0
    pref_pct = (pref_earned_points / pref_total_weight * 100.0) if pref_total_weight > 0 else 60.0

    # ATS Compatibility Score (Keyword presence focus)
    ats_score = round(min(100.0, max(0.0, must_have_pct * 0.7 + pref_pct * 0.3)), 1)

    # Job Readiness Score (Evidence depth focus)
    # Penalized if must-have blockers exist or if evidence level is low
    blocker_penalty = len(blockers) * 8.0
    readiness = must_have_pct * 0.65 + pref_pct * 0.35 - blocker_penalty
    job_readiness_score = round(min(100.0, max(0.0, readiness)), 1)

    # 4. Determine APPLY NOW vs PREPARE FIRST Decision
    if job_readiness_score >= 75.0 and len(blockers) == 0:
        decision = "APPLY NOW"
        rationale = "You satisfy all critical must-have requirements with strong supporting evidence. Focus on tailoring your resume."
        prep_weeks = "0 weeks (Ready to apply)"
    elif job_readiness_score >= 60.0 and len(blockers) <= 1:
        decision = "PREPARE FIRST"
        rationale = f"You are close to competitive, but missing 1 key blocker ({', '.join(blockers[:1])}). A short project will significantly boost candidate strength."
        prep_weeks = "2–3 weeks"
    else:
        decision = "PREPARE FIRST"
        top_blockers_str = ", ".join(blockers[:3]) if blockers else "Critical technical requirements"
        rationale = f"Significant skill gaps detected in key requirements: {top_blockers_str}. Building proof before applying is strongly recommended."
        prep_weeks = "3–6 weeks"

    role_resume_requirements = generate_role_resume_requirements(resume, job)

    return {
        "ats_score": ats_score,
        "job_readiness_score": job_readiness_score,
        "decision": decision,
        "decision_rationale": rationale,
        "prep_time_estimate": prep_weeks,
        "top_blockers": blockers,
        "why_match": why_match_items,
        "why_not_match": why_not_items,
        "coverage_matrix": coverage_matrix,
        "role_resume_requirements": role_resume_requirements
    }


def generate_role_resume_requirements(
    resume: ParsedResumeData,
    job: JobRequirements
) -> Dict[str, Any]:
    """
    Generates a comprehensive blueprint detailing exactly what should be included in the resume
    for the specific job posting.
    """
    all_jd_skills = list(set(
        job.required_skills + job.preferred_skills + job.programming_languages +
        job.frameworks + job.databases + job.cloud + job.tools
    ))

    master_skills = set(
        [s.lower() for s in (resume.skills.programming_languages + resume.skills.frameworks +
         resume.skills.frontend + resume.skills.backend + resume.skills.databases +
         resume.skills.cloud + resume.skills.tools + resume.skills.other)]
    )

    core_skills_checklist = []
    for skill in all_jd_skills:
        in_resume = any(skill.lower() in ms or ms in skill.lower() for ms in master_skills)
        core_skills_checklist.append({
            "skill": skill,
            "status": "In Resume" if in_resume else "Missing / Gap",
            "is_required": skill in job.required_skills or skill in job.programming_languages or skill in job.frameworks
        })

    sample_bullets = []
    top_tech = ", ".join(all_jd_skills[:3]) if all_jd_skills else "Core Software Stack"
    if job.responsibilities:
        for resp in job.responsibilities[:3]:
            sample_bullets.append(f"Engineered solutions for {resp.lower()} leveraging {top_tech}, improving performance & reliability.")
    else:
        sample_bullets = [
            f"Architected scalable backend APIs and microservices utilizing {top_tech}, optimizing throughput by 35%.",
            f"Designed and deployed responsive user interfaces with seamless API integrations, improving user engagement.",
            f"Implemented automated testing and CI/CD pipelines, reducing deployment error rates by 40%."
        ]

    section_checklist = [
        {
            "section": "1. Header & Targeted Title",
            "action": "Specify your exact target role title (e.g. 'Full Stack Developer') right under your name, alongside GitHub, LinkedIn, and Portfolio links."
        },
        {
            "section": "2. Professional Summary",
            "action": f"Craft a concise 3-sentence summary highlighting hands-on expertise in {', '.join(all_jd_skills[:3]) if all_jd_skills else 'software development'} aligned directly with the target job responsibilities."
        },
        {
            "section": "3. Categorized Technical Skills",
            "action": "Group skills clearly into Languages, Frameworks, Databases, Cloud/DevOps, and Tools. List JD-required skills first in each category."
        },
        {
            "section": "4. Projects & Work Experience",
            "action": "Lead every bullet with strong Action Verbs + JD Tech Stack + Quantifiable Outcomes (e.g. 'Optimized latency by 30% using Redis')."
        },
        {
            "section": "5. Education & Technical Certifications",
            "action": "Include degree details, relevant coursework (Data Structures, DBMS, Web Dev), and verifiable technical certifications."
        }
    ]

    return {
        "summary_positioning": f"Position your profile for this role by emphasizing proven experience with {', '.join(all_jd_skills[:4]) if all_jd_skills else 'core job requirements'}.",
        "core_skills_checklist": core_skills_checklist,
        "sample_action_bullets": sample_bullets,
        "domain_keywords": job.domain_requirements if job.domain_requirements else ["RESTful APIs", "Agile / Scrum", "Microservices", "CI/CD", "Unit Testing", "System Architecture"],
        "section_checklist": section_checklist
    }

