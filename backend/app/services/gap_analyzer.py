from typing import List
from app.schemas.resume import ParsedResumeData
from app.schemas.job import JobRequirements
from app.schemas.analysis import LearningRoadmapItem
from app.services.matching_engine import extract_all_resume_skills
from app.services.skill_normalizer import normalize_skill

# Pre-defined learning path templates for common technologies
LEARNING_PATHS = {
    "aws": {
        "related": "Docker & cloud concepts",
        "reason": "Required for cloud hosting and infrastructure management.",
        "steps": [
            "Learn AWS Cloud Practitioner core services (EC2, S3, IAM)",
            "Containerize existing project with Docker",
            "Deploy containerized app on AWS EC2 or Elastic Beanstalk",
            "Configure environment variables & Security Groups"
        ]
    },
    "docker": {
        "related": "Local development & Git",
        "reason": "Crucial for containerizing microservices and ensuring build consistency.",
        "steps": [
            "Understand Docker containers vs Virtual Machines",
            "Write a Dockerfile for your FastAPI or Node.js project",
            "Use Docker Compose to manage multi-container apps (DB + Backend)",
            "Push image to Docker Hub"
        ]
    },
    "kubernetes": {
        "related": "Docker containerization",
        "reason": "Essential for container orchestration and scaling.",
        "steps": [
            "Master Docker containerization fundamentals",
            "Learn Kubernetes Pods, Deployments, and Services",
            "Run local cluster with Minikube or Kind",
            "Deploy multi-tier application YAML configs"
        ]
    },
    "react": {
        "related": "JavaScript & HTML/CSS",
        "reason": "Target role requires building interactive modern frontends.",
        "steps": [
            "Review ES6+ JavaScript (Promises, Async/Await, Destructuring)",
            "Learn React Components, Props, and State hooks (useState, useEffect)",
            "Build REST API client UI with Axios",
            "Implement client-side routing with React Router"
        ]
    },
    "typescript": {
        "related": "JavaScript",
        "reason": "Preferred for type-safe frontend and backend codebases.",
        "steps": [
            "Learn TypeScript syntax, Interfaces, and Types",
            "Refactor existing JavaScript React project to TypeScript",
            "Configure tsconfig.json and strict mode checks"
        ]
    },
    "postgresql": {
        "related": "SQL & Relational Databases",
        "reason": "Core relational database required for backend data modeling.",
        "steps": [
            "Practice SQL Queries (JOINs, Aggregations, Indexing)",
            "Learn PostgreSQL data types and schema design",
            "Integrate PostgreSQL with SQLAlchemy or Prisma ORM"
        ]
    },
    "mongodb": {
        "related": "JSON & Backend development",
        "reason": "Document-oriented database for flexible schema management.",
        "steps": [
            "Understand Document Stores vs Relational DBs",
            "Learn MongoDB CRUD operations and Aggregation pipelines",
            "Integrate Motor / PyMongo with FastAPI"
        ]
    }
}

def analyze_skill_gaps(
    resume: ParsedResumeData, 
    job: JobRequirements, 
    missing_skills: List[str]
) -> List[LearningRoadmapItem]:

    existing_skills = extract_all_resume_skills(resume)
    existing_skills_lower = set(s.lower() for s in existing_skills)
    
    roadmap_items = []

    for skill in missing_skills:
        norm_skill = normalize_skill(skill)
        skill_lower = norm_skill.lower()
        
        is_required = any(s.lower() == skill_lower for s in job.required_skills)
        importance = "Required" if is_required else "Preferred"

        if skill_lower in LEARNING_PATHS:
            info = LEARNING_PATHS[skill_lower]
            related = info["related"]
            reason = info["reason"]
            steps = info["steps"]
        else:
            related = "Existing programming fundamentals"
            reason = f"{importance} requirement in target job description."
            steps = [
                f"Study {norm_skill} documentation and core fundamentals",
                f"Build a mini-project implementing {norm_skill}",
                f"Integrate {norm_skill} with your existing projects"
            ]

        # Check if candidate has existing related skill to customize message
        if "java" in existing_skills_lower and skill_lower in ["spring boot", "spring"]:
            related = "Java programming"
            reason = "Leverage your Java foundation to master Spring Boot backend development."
            steps = [
                "Spring Core dependency injection & annotations",
                "Building REST APIs with Spring MVC",
                "Database access with Spring Data JPA",
                "Securing APIs with Spring Security"
            ]
        elif "python" in existing_skills_lower and skill_lower in ["fastapi", "django"]:
            related = "Python programming"
            reason = "Leverage your Python experience to master backend web frameworks."

        recommendation = f"Learn {norm_skill} fundamentals building on your {related} background."

        roadmap_items.append(LearningRoadmapItem(
            skill=norm_skill,
            importance=importance,
            reason=reason,
            related_skill=related,
            recommendation=recommendation,
            learning_steps=steps
        ))

    return roadmap_items
