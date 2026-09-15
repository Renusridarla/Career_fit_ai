import os
import copy
import logging
from typing import Tuple, List, Dict, Any
from app.services.ai_provider import get_ai_provider, is_ai_configured
from app.schemas.resume import ParsedResumeData, ProjectItem, ExperienceItem, SkillsCategorized
from app.schemas.job import JobRequirements
from app.schemas.tailored_resume import DiffItem
from app.services.skill_normalizer import normalize_skill_list, is_skill_match

logger = logging.getLogger(__name__)

PROMPT_FILE = os.path.join(os.path.dirname(__file__), "..", "prompts", "resume_tailor.txt")

async def tailor_resume(
    original_resume: ParsedResumeData,
    job: JobRequirements,
    missing_skills: List[str]
) -> Tuple[ParsedResumeData, List[DiffItem]]:
    """
    Tailors resume while strictly enforcing Anti-Fabrication Rule.
    """
    if is_ai_configured():
        try:
            with open(PROMPT_FILE, "r", encoding="utf-8") as f:
                prompt_template = f.read()
            
            prompt = prompt_template.format(
                resume_data=original_resume.model_dump_json(),
                job_requirements=job.model_dump_json()
            )

            provider = get_ai_provider()
            json_output = await provider.generate_json(prompt)

            if json_output and "tailored_resume_data" in json_output:
                tailored_data_raw = json_output["tailored_resume_data"]
                changes_raw = json_output.get("changes_made", [])

                # Verify anti-fabrication rule on LLM output
                verified_resume, diffs = audit_and_clean_tailored_resume(
                    original_resume, tailored_data_raw, changes_raw, missing_skills
                )
                return verified_resume, diffs
        except Exception as e:
            logger.error("AI resume tailoring failed, using heuristic tailor: %s", e)

    return tailor_resume_heuristically(original_resume, job, missing_skills)

def audit_and_clean_tailored_resume(
    original: ParsedResumeData,
    tailored_raw: Dict[str, Any],
    changes_raw: List[Dict[str, Any]],
    missing_skills: List[str]
) -> Tuple[ParsedResumeData, List[DiffItem]]:
    """
    Strict anti-fabrication audit function:
    Removes any missing skill or fabricated tech if the LLM attempted to sneak it in!
    """
    tailored = copy.deepcopy(original)
    missing_set = set(s.lower() for s in missing_skills)

    # 1. Update summary if present and genuine
    if "summary" in tailored_raw and isinstance(tailored_raw["summary"], str):
        cleaned_summary = tailored_raw["summary"]
        for m in missing_skills:
            cleaned_summary = cleaned_summary.replace(m, "").replace(m.lower(), "")
        tailored.summary = cleaned_summary.strip()

    # 2. Reorder skills without adding any missing skills
    original_skill_list = set()
    s_orig = original.skills
    for lst in [s_orig.programming_languages, s_orig.frontend, s_orig.backend, s_orig.databases, s_orig.cloud, s_orig.tools, s_orig.frameworks, s_orig.other]:
        for item in lst:
            original_skill_list.add(item.lower())

    # Audit tailored skill buckets
    skills_raw = tailored_raw.get("skills", {})
    if isinstance(skills_raw, dict):
        for cat in ["programming_languages", "frontend", "backend", "databases", "cloud", "tools", "frameworks", "other"]:
            raw_cat_list = skills_raw.get(cat, [])
            valid_cat_list = [s for s in raw_cat_list if s.lower() in original_skill_list and s.lower() not in missing_set]
            if valid_cat_list:
                setattr(tailored.skills, cat, normalize_skill_list(valid_cat_list))

    diff_items = []
    for chg in changes_raw:
        if isinstance(chg, dict):
            diff_items.append(DiffItem(
                section=chg.get("section", "General"),
                original=chg.get("original", ""),
                tailored=chg.get("tailored", ""),
                rationale=chg.get("rationale", "Aligned with job requirements.")
            ))

    if not diff_items:
        diff_items.append(DiffItem(
            section="Professional Summary",
            original=original.summary,
            tailored=tailored.summary,
            rationale="Reframed summary to highlight key technical strengths for target role."
        ))

    return tailored, diff_items

def tailor_resume_heuristically(
    original: ParsedResumeData,
    job: JobRequirements,
    missing_skills: List[str]
) -> Tuple[ParsedResumeData, List[DiffItem]]:
    """
    Rule-based anti-fabrication tailoring engine.
    """
    tailored = copy.deepcopy(original)
    diffs: List[DiffItem] = []

    # 1. Summary tailoring
    matched_reqs = [s for s in job.required_skills if not any(m.lower() == s.lower() for m in missing_skills)]
    if matched_reqs:
        new_summary = f"Results-driven software developer with hands-on expertise in {', '.join(matched_reqs[:3])}. Demonstrated track record of building reliable web applications and solving complex technical challenges."
        diffs.append(DiffItem(
            section="Professional Summary",
            original=original.summary,
            tailored=new_summary,
            rationale=f"Highlighted core competencies in {', '.join(matched_reqs[:3])}."
        ))
        tailored.summary = new_summary

    # 2. Reorder skills so matching ones appear first
    all_job_skills_lower = set(s.lower() for s in job.required_skills + job.preferred_skills)

    for cat in ["programming_languages", "frontend", "backend", "databases", "cloud", "tools", "frameworks", "other"]:
        current_list = getattr(tailored.skills, cat)
        matching_first = [s for s in current_list if s.lower() in all_job_skills_lower]
        remaining = [s for s in current_list if s.lower() not in all_job_skills_lower]
        setattr(tailored.skills, cat, matching_first + remaining)

    # 3. Reorder projects so projects using job tech come first
    if len(tailored.projects) > 1:
        def project_relevance(p: ProjectItem) -> int:
            tech_lower = set(t.lower() for t in p.technologies)
            return len(tech_lower.intersection(all_job_skills_lower))

        tailored.projects.sort(key=project_relevance, reverse=True)
        diffs.append(DiffItem(
            section="Projects",
            original=f"Top project: {original.projects[0].name}" if original.projects else "Default order",
            tailored=f"Top project: {tailored.projects[0].name}",
            rationale="Prioritized projects matching target job technologies."
        ))

    return tailored, diffs
