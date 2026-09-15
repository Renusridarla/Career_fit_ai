import asyncio
import logging
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from app.utils.security import hash_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

MONGODB_URI = "mongodb://localhost:27017"
DATABASE_NAME = "careerfit_db"

async def seed_data():
    logger.info("Connecting to MongoDB for seeding demo data...")
    client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
    db = client[DATABASE_NAME]

    try:
        await client.admin.command('ping')
    except Exception as e:
        logger.warning("MongoDB ping failed: %s. Seeding skipped.", e)
        return

    # Demo User
    demo_email = "student@careerfit.ai"
    await db.users.delete_many({"email": demo_email})
    
    password_hash = hash_password("Password123")
    user_doc = {
        "name": "Alex Johnson",
        "email": demo_email,
        "password_hash": password_hash,
        "created_at": datetime.utcnow()
    }
    user_res = await db.users.insert_one(user_doc)
    user_id = str(user_res.inserted_id)
    logger.info("Created Demo User: %s (ID: %s)", demo_email, user_id)

    # Demo Master Resume
    resume_doc = {
        "user_id": user_id,
        "original_filename": "Alex_Johnson_Resume.pdf",
        "raw_text": "Alex Johnson\nFull Stack Developer Student\nalex@university.edu | (555) 123-4567\nSkills: Python, JavaScript, React, Node.js, Express.js, MongoDB, HTML, CSS, Git, REST APIs\nEducation: B.S. Computer Science, State University, 2024, GPA: 3.8/4.0\nProjects:\nTeam Collaboration Portal: Developed REST APIs using Express.js and MongoDB. Built React frontend with Tailwind CSS.",
        "parsed_data": {
            "summary": "Enthusiastic Full Stack Web Developer student proficient in React, Node.js, Python, and MongoDB with experience building REST APIs.",
            "personal": {
                "name": "Alex Johnson",
                "email": "alex@university.edu",
                "phone": "(555) 123-4567",
                "location": "San Francisco, CA",
                "linkedin": "https://linkedin.com/in/alexjohnson",
                "github": "https://github.com/alexjohnson"
            },
            "education": [
                {
                    "degree": "Bachelor of Science",
                    "institution": "State University",
                    "field": "Computer Science",
                    "graduation_year": "2024",
                    "cgpa": "3.8/4.0"
                }
            ],
            "skills": {
                "programming_languages": ["Python", "JavaScript", "SQL", "HTML", "CSS"],
                "frontend": ["React", "Tailwind CSS"],
                "backend": ["Node.js", "Express.js", "FastAPI"],
                "databases": ["MongoDB", "PostgreSQL"],
                "cloud": ["Docker"],
                "tools": ["Git", "GitHub", "Postman"],
                "frameworks": ["REST APIs"],
                "other": []
            },
            "experience": [
                {
                    "company": "Tech Solutions Inc.",
                    "role": "Software Engineering Intern",
                    "dates": "May 2023 - Aug 2023",
                    "responsibilities": [
                        "Developed backend REST API endpoints using Express.js and MongoDB.",
                        "Built responsive React components with Tailwind CSS.",
                        "Wrote automated unit tests with Jest."
                    ],
                    "achievements": ["Reduced API response times by 20%."]
                }
            ],
            "projects": [
                {
                    "name": "Team Collaboration Portal",
                    "description": "Full stack web application for student group project management.",
                    "technologies": ["React", "Node.js", "Express.js", "MongoDB"],
                    "achievements": ["Deployed for 200+ university students."]
                }
            ],
            "certifications": ["AWS Cloud Practitioner"],
            "achievements": ["Dean's List 2022-2024"]
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.resumes.delete_many({"user_id": user_id})
    await db.resumes.insert_one(resume_doc)
    logger.info("Created Demo Master Resume for %s", demo_email)

    # Demo Job Description
    job_doc = {
        "user_id": user_id,
        "company": "Acme Software Corp",
        "title": "Full Stack Developer",
        "description": "We are seeking a Full Stack Developer proficient in React, Node.js, REST APIs, and PostgreSQL. Preferred qualifications include AWS cloud deployment experience and Docker containerization.",
        "url": "https://careers.acme.com/jobs/fullstack-dev",
        "location": "Remote / San Francisco",
        "parsed_requirements": {
            "required_skills": ["React", "Node.js", "REST APIs", "PostgreSQL"],
            "preferred_skills": ["AWS", "Docker"],
            "programming_languages": ["JavaScript", "SQL"],
            "frameworks": ["React", "Node.js", "Express.js"],
            "databases": ["PostgreSQL"],
            "cloud": ["AWS", "Docker"],
            "tools": ["Git"],
            "soft_skills": ["Teamwork", "Problem Solving"],
            "education_requirements": ["B.S. in Computer Science"],
            "experience_requirements": ["0-2 years software development experience"],
            "responsibilities": ["Develop REST APIs", "Build React UI"],
            "domain_requirements": ["Web Development"]
        },
        "created_at": datetime.utcnow()
    }
    await db.jobs.delete_many({"user_id": user_id})
    await db.jobs.insert_one(job_doc)
    logger.info("Created Demo Job Description for Acme Software Corp")

    logger.info("Demo data seeding finished successfully! User: student@careerfit.ai / Password123")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
