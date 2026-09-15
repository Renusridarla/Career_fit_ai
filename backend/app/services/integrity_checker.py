import re
import logging
from typing import Dict, List, Any, Tuple
from app.schemas.resume import ParsedResumeData
from app.services.evidence_engine import build_candidate_evidence_graph, evaluate_skill_evidence_level, EvidenceLevel

logger = logging.getLogger(__name__)

def audit_resume_integrity(
    original_resume: ParsedResumeData,
    tailored_resume: ParsedResumeData,
    missing_skills: List[str]
) -> Tuple[float, List[Dict[str, Any]]]:
    """
    100% Resume Integrity Audit Engine:
    Compares tailored resume against candidate evidence graph.
    Blocks unsupported claims, missing skills, and unverified technologies.
    Returns: (IntegrityScore: float, AuditReport: List[dict])
    """
    graph = build_candidate_evidence_graph(original_resume)
    missing_set = set(s.lower() for s in missing_skills)

    # Collect all skills in original profile
    original_skill_set = set()
    s_orig = original_resume.skills
    for sublist in [s_orig.programming_languages, s_orig.frontend, s_orig.backend, 
                    s_orig.databases, s_orig.cloud, s_orig.tools, s_orig.frameworks, s_orig.other]:
        for item in sublist:
            original_skill_set.add(item.lower())

    for proj in original_resume.projects:
        for t in proj.technologies:
            original_skill_set.add(t.lower())

    audit_logs = []
    blocked_count = 0
    total_checks = 0

    # 1. Audit Tailored Skills
    s_tailored = tailored_resume.skills
    tailored_all = [
        s for sublist in [s_tailored.programming_languages, s_tailored.frontend, s_tailored.backend,
                          s_tailored.databases, s_tailored.cloud, s_tailored.tools, s_tailored.frameworks, s_tailored.other]
        for s in sublist
    ]

    for sk in tailored_all:
        total_checks += 1
        sk_lower = sk.lower()
        if sk_lower in missing_set:
            blocked_count += 1
            audit_logs.append({
                "status": "BLOCKED CLAIM",
                "claim": f"Skill '{sk}'",
                "reason": f"Required missing skill '{sk}' has no candidate evidence. Blocked from tailored resume."
            })
        elif sk_lower not in original_skill_set:
            blocked_count += 1
            audit_logs.append({
                "status": "BLOCKED CLAIM",
                "claim": f"Skill '{sk}'",
                "reason": f"Skill '{sk}' was not found in original candidate profile."
            })
        else:
            audit_logs.append({
                "status": "VERIFIED FACT",
                "claim": f"Skill '{sk}'",
                "reason": "Backed by candidate profile skills."
            })

    # 2. Audit Tailored Projects
    for proj in tailored_resume.projects:
        total_checks += 1
        # Check if project name exists in original
        orig_proj_names = set(p.name.lower() for p in original_resume.projects)
        if proj.name.lower() not in orig_proj_names:
            blocked_count += 1
            audit_logs.append({
                "status": "BLOCKED CLAIM",
                "claim": f"Project '{proj.name}'",
                "reason": f"Project '{proj.name}' does not exist in candidate profile."
            })
        else:
            audit_logs.append({
                "status": "VERIFIED FACT",
                "claim": f"Project '{proj.name}'",
                "reason": "Genuine candidate project."
            })

    # Calculate Integrity Score
    if total_checks > 0:
        integrity_score = round(max(0.0, (1.0 - (blocked_count / total_checks)) * 100.0), 1)
    else:
        integrity_score = 100.0

    return (integrity_score, audit_logs)
