import os
import re
import logging
from typing import Dict, Any
from app.services.ai_provider import get_ai_provider, is_ai_configured
from app.schemas.resume import ParsedResumeData, PersonalInfo, SkillsCategorized, EducationItem, ExperienceItem, ProjectItem
from app.services.skill_normalizer import normalize_skill_list

logger = logging.getLogger(__name__)

PROMPT_FILE = os.path.join(os.path.dirname(__file__), "..", "prompts", "resume_parser.txt")

async def parse_resume_text(raw_text: str) -> ParsedResumeData:
    """
    Pipeline: Raw text -> LLM / Heuristic Structured Parsing -> Skill Normalization -> Pydantic Validation
    """
    if is_ai_configured():
        try:
            with open(PROMPT_FILE, "r", encoding="utf-8") as f:
                prompt_template = f.read()
            prompt = prompt_template.format(resume_text=raw_text)
            
            provider = get_ai_provider()
            json_output = await provider.generate_json(prompt)
            
            if json_output:
                parsed = normalize_and_validate_parsed_resume(json_output, raw_text)
                return parsed
        except Exception as e:
            logger.error("AI resume parsing failed, using heuristic parser: %s", e)

    # Fallback heuristic parser if AI key is missing or failed
    return parse_resume_heuristically(raw_text)

def normalize_and_validate_parsed_resume(data: Dict[str, Any], raw_text: str) -> ParsedResumeData:
    skills_raw = data.get("skills", {})
    if isinstance(skills_raw, list):
        skills_raw = {"other": skills_raw}

    categorized = SkillsCategorized(
        programming_languages=normalize_skill_list(skills_raw.get("programming_languages", [])),
        frontend=normalize_skill_list(skills_raw.get("frontend", [])),
        backend=normalize_skill_list(skills_raw.get("backend", [])),
        databases=normalize_skill_list(skills_raw.get("databases", [])),
        cloud=normalize_skill_list(skills_raw.get("cloud", [])),
        tools=normalize_skill_list(skills_raw.get("tools", [])),
        frameworks=normalize_skill_list(skills_raw.get("frameworks", [])),
        other=normalize_skill_list(skills_raw.get("other", []))
    )

    education_items = []
    for edu in data.get("education", []):
        if isinstance(edu, dict):
            education_items.append(EducationItem(**edu))

    experience_items = []
    for exp in data.get("experience", []):
        if isinstance(exp, dict):
            experience_items.append(ExperienceItem(**exp))

    project_items = []
    for proj in data.get("projects", []):
        if isinstance(proj, dict):
            proj_tech = normalize_skill_list(proj.get("technologies", []))
            proj["technologies"] = proj_tech
            project_items.append(ProjectItem(**proj))

    personal = PersonalInfo(**data.get("personal", {}))

    return ParsedResumeData(
        summary=data.get("summary", raw_text[:300].replace("\n", " ").strip()),
        personal=personal,
        education=education_items,
        skills=categorized,
        experience=experience_items,
        projects=project_items,
        certifications=data.get("certifications", []),
        achievements=data.get("achievements", [])
    )

def parse_resume_heuristically(text: str) -> ParsedResumeData:
    """
    Robust regex and keyword pattern fallback parser.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    # Extract email & phone
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    linkedin_match = re.search(r'linkedin\.com/in/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
    github_match = re.search(r'github\.com/[a-zA-Z0-9_-]+', text, re.IGNORECASE)

    name = lines[0] if lines else "Student Candidate"
    if "@" in name:
        name = "Student Candidate"

    personal = PersonalInfo(
        name=name,
        email=email_match.group(0) if email_match else "",
        phone=phone_match.group(0) if phone_match else "",
        linkedin=f"https://{linkedin_match.group(0)}" if linkedin_match else "",
        github=f"https://{github_match.group(0)}" if github_match else ""
    )

    # Common tech keywords
    known_langs = ["Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "SQL", "HTML", "CSS", "PHP", "Ruby"]
    known_fe = ["React", "Vue.js", "Angular", "Tailwind CSS", "Bootstrap", "Next.js", "Redux"]
    known_be = ["FastAPI", "Node.js", "Express.js", "Django", "Flask", "Spring Boot", "REST APIs", "GraphQL"]
    known_db = ["MongoDB", "PostgreSQL", "MySQL", "Redis", "SQLite"]
    known_cloud = ["AWS", "Docker", "Kubernetes", "GCP", "Azure"]
    known_tools = ["Git", "GitHub", "Jira", "Postman", "Linux", "VS Code"]

    prog_langs = [tech for tech in known_langs if re.search(rf'\b{re.escape(tech)}\b', text, re.IGNORECASE)]
    fe = [tech for tech in known_fe if re.search(rf'\b{re.escape(tech)}\b', text, re.IGNORECASE)]
    be = [tech for tech in known_be if re.search(rf'\b{re.escape(tech)}\b', text, re.IGNORECASE)]
    db = [tech for tech in known_db if re.search(rf'\b{re.escape(tech)}\b', text, re.IGNORECASE)]
    cloud = [tech for tech in known_cloud if re.search(rf'\b{re.escape(tech)}\b', text, re.IGNORECASE)]
    tools = [tech for tech in known_tools if re.search(rf'\b{re.escape(tech)}\b', text, re.IGNORECASE)]

    skills = SkillsCategorized(
        programming_languages=normalize_skill_list(prog_langs),
        frontend=normalize_skill_list(fe),
        backend=normalize_skill_list(be),
        databases=normalize_skill_list(db),
        cloud=normalize_skill_list(cloud),
        tools=normalize_skill_list(tools),
    )

    # Heuristic project / experience extraction
    projects = []
    proj_indices = [i for i, l in enumerate(lines) if "project" in l.lower()]
    if proj_indices:
        p_start = proj_indices[0] + 1
        p_lines = lines[p_start:p_start+6]
        projects.append(ProjectItem(
            name=p_lines[0] if p_lines else "Academic Project",
            description=" ".join(p_lines[1:3]) if len(p_lines) > 2 else "Project developed during coursework.",
            technologies=normalize_skill_list(prog_langs[:2] + fe[:1] + be[:1])
        ))

    summary = f"Enthusiastic candidate skilled in {', '.join(prog_langs[:3]) if prog_langs else 'software development'}."

    return ParsedResumeData(
        summary=summary,
        personal=personal,
        education=[EducationItem(degree="Bachelor of Science", institution="University", field="Computer Science", graduation_year="2024")],
        skills=skills,
        experience=[],
        projects=projects,
        certifications=[],
        achievements=[]
    )
