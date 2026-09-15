import logging
from typing import Dict, List, Any
from app.schemas.resume import ParsedResumeData
from app.schemas.job import JobRequirements
from app.services.skill_normalizer import normalize_skill

logger = logging.getLogger(__name__)

PROJECT_TEMPLATES = [
    {
        "id": "fullstack_cloud_app",
        "title": "Cloud-Native Task & Career Management Portal",
        "technologies": ["Spring Boot", "PostgreSQL", "Docker", "AWS", "REST APIs"],
        "purpose": "Provides single-project evidence covering backend framework, relational database, containerization, and cloud deployment.",
        "objective": "Build a modular RESTful backend web service with automated database migrations and cloud hosting.",
        "features": [
            "JWT Authentication & Role-Based Access Control",
            "RESTful API design with Swagger/OpenAPI documentation",
            "PostgreSQL relational data persistence with JPA/Hibernate",
            "Docker containerization & AWS EC2 deployment"
        ],
        "milestones": [
            "Milestone 1: Setup Spring Boot & PostgreSQL database schema",
            "Milestone 2: Implement RESTful API endpoints for user and task resources",
            "Milestone 3: Write Dockerfile and docker-compose.yml configuration",
            "Milestone 4: Deploy Docker container onto AWS EC2 instance"
        ],
        "evidence_to_add": "Developed a Spring Boot REST API backed by PostgreSQL, containerized with Docker, and deployed on AWS EC2."
    },
    {
        "id": "fullstack_react_fastapi",
        "title": "Real-Time Collaborative Analytics Dashboard",
        "technologies": ["React", "FastAPI", "MongoDB", "Docker", "Tailwind CSS"],
        "purpose": "Provides end-to-end full stack web evidence for frontend, async backend, NoSQL database, and UI design.",
        "objective": "Design an interactive analytics dashboard with real-time data visualization and async backend services.",
        "features": [
            "React frontend with custom dynamic chart visualization",
            "FastAPI async backend service with Motor MongoDB integration",
            "Tailwind CSS responsive dark-mode interface",
            "Docker Compose multi-container setup"
        ],
        "milestones": [
            "Milestone 1: Build FastAPI endpoints for data ingestion",
            "Milestone 2: Design React dashboard UI components with Recharts",
            "Milestone 3: Integrate MongoDB document store",
            "Milestone 4: Multi-container deployment with Docker Compose"
        ],
        "evidence_to_add": "Built a full stack real-time analytics dashboard using React, FastAPI, MongoDB, and Docker."
    },
    {
        "id": "microservices_devops",
        "title": "Microservices E-Commerce Service Mesh",
        "technologies": ["Java", "Spring Boot", "Kubernetes", "Docker", "Kafka"],
        "purpose": "Demonstrates advanced microservices architecture, container orchestration, and message queuing.",
        "objective": "Develop decoupled microservices communicating via event-driven messaging.",
        "features": [
            "Decoupled Product, Order, and Notification services",
            "Kafka asynchronous event stream integration",
            "Kubernetes local deployment manifests",
            "Distributed tracing & logging"
        ],
        "milestones": [
            "Milestone 1: Build core Spring Boot microservice modules",
            "Milestone 2: Configure Kafka topic producers and consumers",
            "Milestone 3: Containerize with Docker and create Kubernetes manifests"
        ],
        "evidence_to_add": "Implemented event-driven microservices architecture using Spring Boot, Kafka, Docker, and Kubernetes."
    }
]

def recommend_unified_project(
    resume: ParsedResumeData,
    job: JobRequirements,
    missing_skills: List[str]
) -> Dict[str, Any]:
    """
    Synthesizes a single project recommendation covering maximum missing job requirements.
    """
    if not missing_skills:
        return {
            "title": "Advanced Performance Optimization & CI/CD Pipeline",
            "purpose": "You already match core requirements! This project adds advanced CI/CD and automated testing proof.",
            "covered_requirements": ["CI/CD", "Automated Testing", "Performance Tuning"],
            "features": ["GitHub Actions workflow", "Load testing with Locust", "Code coverage reports"],
            "milestones": ["Configure GitHub Actions", "Add integration tests"],
            "evidence_to_add": "Implemented automated CI/CD pipeline with GitHub Actions and performance test suites."
        }

    missing_lower = set(s.lower() for s in missing_skills)

    best_template = None
    best_overlap = -1
    best_covered = []

    for template in PROJECT_TEMPLATES:
        template_techs_lower = set(t.lower() for t in template["technologies"])
        overlap = missing_lower.intersection(template_techs_lower)
        if len(overlap) > best_overlap:
            best_overlap = len(overlap)
            best_template = template
            best_covered = [t for t in template["technologies"] if t.lower() in missing_lower or t in job.required_skills]

    if not best_template:
        best_template = PROJECT_TEMPLATES[0]
        best_covered = missing_skills[:4]

    return {
        "title": best_template["title"],
        "purpose": best_template["purpose"],
        "objective": best_template["objective"],
        "technologies": best_template["technologies"],
        "covered_requirements": best_covered if best_covered else missing_skills[:4],
        "features": best_template["features"],
        "milestones": best_template["milestones"],
        "evidence_to_add": best_template["evidence_to_add"]
    }
