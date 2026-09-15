from typing import List
from app.schemas.resume import ParsedResumeData
from app.schemas.job import JobRequirements

def generate_recommendations(
    resume: ParsedResumeData,
    job: JobRequirements,
    matched_skills: List[str],
    missing_skills: List[str]
) -> List[str]:

    recommendations = []

    if matched_skills:
        top_matches = ", ".join(matched_skills[:3])
        recommendations.append(
            f"Highlight your direct experience in {top_matches} prominently in your summary and project titles."
        )

    if len(resume.projects) > 0:
        recommendations.append(
            "Reorder your project list so projects utilizing target technologies appear at the very top."
        )

    if missing_skills:
        recommendations.append(
            f"Do not fabricate missing skills ({', '.join(missing_skills[:3])}). Focus on demonstrating core software engineering principles and follow the personalized learning roadmap."
        )

    if resume.experience:
        recommendations.append(
            "Quantify achievements in your experience bullet points with measurable metrics (e.g. latency reductions, test coverage, user counts)."
        )

    return recommendations
