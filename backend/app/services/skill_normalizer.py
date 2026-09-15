import re
from typing import List, Dict, Set

# Comprehensive canonical mapping dictionary
SKILL_ALIASES: Dict[str, str] = {
    "js": "JavaScript",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "py": "Python",
    "python": "Python",
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "express": "Express.js",
    "express.js": "Express.js",
    "expressjs": "Express.js",
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "vue": "Vue.js",
    "vue.js": "Vue.js",
    "vuejs": "Vue.js",
    "angular": "Angular",
    "angularjs": "Angular",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "psql": "PostgreSQL",
    "mysql": "MySQL",
    "sqlite": "SQLite",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "restful api": "REST APIs",
    "restful apis": "REST APIs",
    "graphql": "GraphQL",
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "GCP",
    "google cloud platform": "GCP",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "docker": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "html": "HTML",
    "html5": "HTML",
    "css": "CSS",
    "css3": "CSS",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "cicd": "CI/CD",
    "ci/cd": "CI/CD",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "springboot": "Spring Boot",
    "java": "Java",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "csharp": "C#",
    "golang": "Go",
    "go": "Go",
    "rust": "Rust",
}

def normalize_skill(skill_name: str) -> str:
    if not skill_name:
        return ""
    clean_name = skill_name.strip()
    lookup_key = clean_name.lower()
    
    if lookup_key in SKILL_ALIASES:
        return SKILL_ALIASES[lookup_key]
    
    # Capitalize cleanly if unknown
    return clean_name.title() if len(clean_name) <= 15 else clean_name

def normalize_skill_list(skills: List[str]) -> List[str]:
    seen: Set[str] = set()
    result: List[str] = []
    for s in skills:
        norm = normalize_skill(s)
        if norm and norm.lower() not in seen:
            seen.add(norm.lower())
            result.append(norm)
    return result

def is_skill_match(skill1: str, skill2: str) -> bool:
    norm1 = normalize_skill(skill1)
    norm2 = normalize_skill(skill2)
    return norm1.lower() == norm2.lower()
