import os
import re
import logging
from typing import Dict, Any
from app.services.ai_provider import get_ai_provider, is_ai_configured
from app.schemas.job import JobRequirements
from app.services.skill_normalizer import normalize_skill_list

logger = logging.getLogger(__name__)

PROMPT_FILE = os.path.join(os.path.dirname(__file__), "..", "prompts", "jd_analyzer.txt")

async def analyze_job_description(description: str) -> JobRequirements:
    """
    Analyzes job description and extracts categorized requirements.
    """
    if is_ai_configured():
        try:
            with open(PROMPT_FILE, "r", encoding="utf-8") as f:
                prompt_template = f.read()
            prompt = prompt_template.format(job_description=description)

            provider = get_ai_provider()
            json_output = await provider.generate_json(prompt)

            if json_output:
                return normalize_and_validate_jd_requirements(json_output)
        except Exception as e:
            logger.error("AI JD analysis failed, using heuristic analyzer: %s", e)

    return analyze_jd_heuristically(description)

def normalize_and_validate_jd_requirements(data: Dict[str, Any]) -> JobRequirements:
    req_skills = normalize_skill_list(data.get("required_skills", []))
    pref_skills = normalize_skill_list(data.get("preferred_skills", []))

    # Ensure required & preferred are distinct
    req_set = set(s.lower() for s in req_skills)
    pref_skills = [s for s in pref_skills if s.lower() not in req_set]

    return JobRequirements(
        required_skills=req_skills,
        preferred_skills=pref_skills,
        programming_languages=normalize_skill_list(data.get("programming_languages", [])),
        frameworks=normalize_skill_list(data.get("frameworks", [])),
        databases=normalize_skill_list(data.get("databases", [])),
        cloud=normalize_skill_list(data.get("cloud", [])),
        tools=normalize_skill_list(data.get("tools", [])),
        soft_skills=data.get("soft_skills", []),
        education_requirements=data.get("education_requirements", []),
        experience_requirements=data.get("experience_requirements", []),
        responsibilities=data.get("responsibilities", []),
        domain_requirements=data.get("domain_requirements", [])
    )

def analyze_jd_heuristically(description: str) -> JobRequirements:
    known_techs = [
        "React", "Node.js", "Express.js", "Python", "JavaScript", "TypeScript",
        "FastAPI", "MongoDB", "PostgreSQL", "MySQL", "AWS", "Docker", "Kubernetes",
        "Git", "REST APIs", "GraphQL", "Java", "C++", "Tailwind CSS", "Bootstrap", "Redux"
    ]

    found_techs = []
    for tech in known_techs:
        if re.search(rf'\b{re.escape(tech)}\b', description, re.IGNORECASE):
            found_techs.append(tech)

    normalized_found = normalize_skill_list(found_techs)

    # Simple heuristic split: first 60% required, remaining preferred
    split_idx = max(1, int(len(normalized_found) * 0.6))
    required = normalized_found[:split_idx]
    preferred = normalized_found[split_idx:]

    responsibilities = [
        line.strip() for line in description.split("\n")
        if any(keyword in line.lower() for keyword in ["develop", "build", "design", "maintain", "collaborate", "responsible"])
    ]

    return JobRequirements(
        required_skills=required,
        preferred_skills=preferred,
        programming_languages=[t for t in normalized_found if t in ["Python", "JavaScript", "TypeScript", "Java", "C++"]],
        frameworks=[t for t in normalized_found if t in ["React", "FastAPI", "Express.js", "Node.js", "Tailwind CSS"]],
        databases=[t for t in normalized_found if t in ["MongoDB", "PostgreSQL", "MySQL"]],
        cloud=[t for t in normalized_found if t in ["AWS", "Docker", "Kubernetes"]],
        tools=[t for t in normalized_found if t in ["Git", "REST APIs", "GraphQL"]],
        soft_skills=["Problem Solving", "Team Collaboration", "Communication"],
        education_requirements=["Bachelor's degree in Computer Science or related field"],
        experience_requirements=["Relevant software development project experience"],
        responsibilities=responsibilities[:5] if responsibilities else ["Build and maintain web application features"],
        domain_requirements=["Full Stack Web Development"]
    )
