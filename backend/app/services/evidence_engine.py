import re
import logging
from typing import Dict, List, Any, Tuple
from app.schemas.resume import ParsedResumeData
from app.services.skill_normalizer import normalize_skill, is_skill_match

logger = logging.getLogger(__name__)

class EvidenceLevel:
    LEVEL_0_NO_EVIDENCE = 0          # No evidence in profile
    LEVEL_1_MENTIONED = 1            # Mentioned in skills list only
    LEVEL_2_PROJECT_EVIDENCE = 2     # Used in 1 project
    LEVEL_3_MULTIPLE_EVIDENCE = 3    # Used across multiple projects / certifications
    LEVEL_4_PROFESSIONAL = 4         # Supported by work experience / internship

LEVEL_DESCRIPTIONS = {
    0: "No Evidence (Missing from profile)",
    1: "Mentioned (Listed in skills section)",
    2: "Project Evidence (Used in 1 project)",
    3: "Multiple Evidence (Used across multiple projects/certifications)",
    4: "Professional Evidence (Supported by work experience/internship)"
}

def build_candidate_evidence_graph(resume: ParsedResumeData) -> Dict[str, Any]:
    """
    Constructs a structured Candidate Knowledge & Evidence Graph mapping
    Skills -> Projects / Experience / Certifications -> Concrete Evidence Snippets.
    """
    graph: Dict[str, Dict[str, Any]] = {}

    def get_or_create_node(skill: str) -> Dict[str, Any]:
        norm = normalize_skill(skill)
        key = norm.lower()
        if key not in graph:
            graph[key] = {
                "skill": norm,
                "mentioned": False,
                "projects": [],
                "experience": [],
                "certifications": [],
                "evidence_snippets": []
            }
        return graph[key]

    # 1. Map Skills Section (Level 1 base)
    s = resume.skills
    all_listed = (
        s.programming_languages + s.frontend + s.backend + 
        s.databases + s.cloud + s.tools + s.frameworks + s.other
    )
    for skill in all_listed:
        node = get_or_create_node(skill)
        node["mentioned"] = True

    # 2. Map Projects (Level 2/3)
    for proj in resume.projects:
        proj_techs = proj.technologies
        proj_text = f"{proj.name} {proj.description} {' '.join(proj.achievements)}"

        # Check explicit technologies list
        for tech in proj_techs:
            node = get_or_create_node(tech)
            node["projects"].append({
                "name": proj.name,
                "description": proj.description,
                "evidence_snippet": f"Used in project '{proj.name}': {proj.description[:120]}..."
            })
            node["evidence_snippets"].append(f"Project '{proj.name}': {proj.description}")

    # 3. Map Experience (Level 4)
    for exp in resume.experience:
        exp_text = f"{exp.company} {exp.role} {' '.join(exp.responsibilities)} {' '.join(exp.achievements)}"

        for key, node in list(graph.items()):
            skill_name = node["skill"]
            if re.search(rf'\b{re.escape(skill_name)}\b', exp_text, re.IGNORECASE):
                node["experience"].append({
                    "company": exp.company,
                    "role": exp.role,
                    "dates": exp.dates,
                    "responsibilities": exp.responsibilities
                })
                node["evidence_snippets"].append(f"Work Experience at {exp.company} ({exp.role})")

    # 4. Map Certifications
    for cert in resume.certifications:
        for key, node in list(graph.items()):
            skill_name = node["skill"]
            if re.search(rf'\b{re.escape(skill_name)}\b', cert, re.IGNORECASE):
                node["certifications"].append(cert)
                node["evidence_snippets"].append(f"Certification: {cert}")

    return graph

def evaluate_skill_evidence_level(skill: str, graph: Dict[str, Any]) -> Tuple[int, str, List[Dict[str, Any]]]:
    """
    Calculates Evidence Level (0 to 4) for a target skill given the candidate evidence graph.
    """
    norm = normalize_skill(skill)
    key = norm.lower()

    if key not in graph:
        # Check alias lookup
        found_node = None
        for g_key, g_node in graph.items():
            if is_skill_match(norm, g_node["skill"]):
                found_node = g_node
                break
        if not found_node:
            return (EvidenceLevel.LEVEL_0_NO_EVIDENCE, LEVEL_DESCRIPTIONS[0], [])
        node = found_node
    else:
        node = graph[key]

    evidence_items = []
    
    # Collect project evidence
    for p in node["projects"]:
        evidence_items.append({
            "type": "project",
            "source": f"Project '{p['name']}'",
            "snippet": p["evidence_snippet"]
        })

    # Collect experience evidence
    for e in node["experience"]:
        evidence_items.append({
            "type": "experience",
            "source": f"Experience at {e['company']}",
            "snippet": f"Role: {e['role']} - {' '.join(e['responsibilities'][:2])}"
        })

    # Collect certification evidence
    for c in node["certifications"]:
        evidence_items.append({
            "type": "certification",
            "source": f"Certification",
            "snippet": c
        })

    num_projects = len(node["projects"])
    num_exp = len(node["experience"])
    num_cert = len(node["certifications"])

    if num_exp > 0:
        level = EvidenceLevel.LEVEL_4_PROFESSIONAL
    elif (num_projects + num_cert) >= 2:
        level = EvidenceLevel.LEVEL_3_MULTIPLE_EVIDENCE
    elif num_projects == 1:
        level = EvidenceLevel.LEVEL_2_PROJECT_EVIDENCE
    elif node["mentioned"]:
        level = EvidenceLevel.LEVEL_1_MENTIONED
    else:
        level = EvidenceLevel.LEVEL_0_NO_EVIDENCE

    return (level, LEVEL_DESCRIPTIONS[level], evidence_items)
