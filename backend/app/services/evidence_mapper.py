from typing import List
from app.schemas.resume import ParsedResumeData
from app.schemas.job import JobRequirements
from app.schemas.analysis import EvidenceItem
from app.services.matching_engine import match_requirement, extract_all_resume_skills

def map_requirements_to_evidence(resume: ParsedResumeData, job: JobRequirements) -> List[EvidenceItem]:
    all_user_skills = extract_all_resume_skills(resume)
    evidence_list = []

    for req in job.required_skills:
        status, text, source = match_requirement(req, resume, all_user_skills)
        evidence_list.append(EvidenceItem(
            requirement=req,
            category=status,
            priority="REQUIRED",
            evidence_text=text,
            source_section=source
        ))

    for req in job.preferred_skills:
        status, text, source = match_requirement(req, resume, all_user_skills)
        evidence_list.append(EvidenceItem(
            requirement=req,
            category=status,
            priority="PREFERRED",
            evidence_text=text,
            source_section=source
        ))

    return evidence_list
