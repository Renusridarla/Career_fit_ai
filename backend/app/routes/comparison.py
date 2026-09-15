from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.config.database import db_manager
from app.dependencies.auth import get_current_user
from app.schemas.resume import ParsedResumeData
from app.schemas.job import JobRequirements
from app.services.readiness_engine import evaluate_job_readiness
from app.services.skill_normalizer import normalize_skill

router = APIRouter(prefix="/api/comparison", tags=["Multiple Job Comparison & Heatmap"])

@router.get("/heatmap")
async def get_multi_job_heatmap(current_user: dict = Depends(get_current_user)):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    user_id = current_user["id"]

    # 1. Fetch Candidate Master Resume
    resume_doc = await db.resumes.find_one({"user_id": user_id})
    if not resume_doc:
        return {
            "jobs": [],
            "heatmap_matrix": [],
            "best_fit": None,
            "best_growth": None,
            "highest_value_skill": None
        }

    resume = ParsedResumeData(**resume_doc["parsed_data"])

    # 2. Fetch User Jobs
    jobs_cursor = db.jobs.find({"user_id": user_id}).sort("created_at", -1)
    jobs_list = []
    async for j in jobs_cursor:
        jobs_list.append(j)

    if not jobs_list:
        return {
            "jobs": [],
            "heatmap_matrix": [],
            "best_fit": None,
            "best_growth": None,
            "highest_value_skill": None
        }

    job_evaluations = []
    all_job_skills = set()
    skill_job_counts: Dict[str, int] = {}

    for j_doc in jobs_list[:5]: # Compare top 5 jobs
        j_id = str(j_doc["_id"])
        j_title = f"{j_doc['company']} - {j_doc['title']}"
        j_reqs = JobRequirements(**j_doc["parsed_requirements"])

        readiness_res = evaluate_job_readiness(resume, j_reqs)

        job_evaluations.append({
            "job_id": j_id,
            "company": j_doc["company"],
            "title": j_doc["title"],
            "ats_score": readiness_res["ats_score"],
            "job_readiness_score": readiness_res["job_readiness_score"],
            "decision": readiness_res["decision"],
            "top_blockers": readiness_res["top_blockers"],
            "coverage_matrix": readiness_res["coverage_matrix"]
        })

        for req in j_reqs.required_skills + j_reqs.preferred_skills:
            norm = normalize_skill(req)
            all_job_skills.add(norm)
            skill_job_counts[norm] = skill_job_counts.get(norm, 0) + 1

    # Build Heatmap Matrix Rows
    heatmap_rows = []
    for skill_name in sorted(all_job_skills):
        row = {
            "skill": skill_name,
            "occurrences": skill_job_counts[skill_name],
            "job_statuses": {}
        }
        for eval_item in job_evaluations:
            j_id = eval_item["job_id"]
            # Find status in coverage matrix
            matched_item = next(
                (c for c in eval_item["coverage_matrix"] if c["requirement"].lower() == skill_name.lower()),
                None
            )
            if matched_item:
                row["job_statuses"][j_id] = matched_item["match_status"] # 'STRONG MATCH', 'PARTIAL MATCH', 'MISSING'
            else:
                row["job_statuses"][j_id] = "NOT_REQUIRED"

        heatmap_rows.append(row)

    # Sort skills by occurrence frequency across target jobs
    heatmap_rows.sort(key=lambda r: r["occurrences"], reverse=True)

    # Evaluate Best Fit & Best Growth Opportunity
    sorted_by_readiness = sorted(job_evaluations, key=lambda e: e["job_readiness_score"], reverse=True)
    best_fit = sorted_by_readiness[0] if sorted_by_readiness else None

    # Growth opportunity: Job with high potential but moderate score
    best_growth = next((j for j in sorted_by_readiness if 50.0 <= j["job_readiness_score"] < 75.0), sorted_by_readiness[-1] if sorted_by_readiness else None)

    # Highest Value Skill to Learn (Required by most jobs but missing in candidate profile)
    highest_val_skill = None
    max_missing_freq = 0
    for row in heatmap_rows:
        missing_in_jobs = sum(1 for status in row["job_statuses"].values() if status == "MISSING")
        if missing_in_jobs > max_missing_freq:
            max_missing_freq = missing_in_jobs
            highest_val_skill = {
                "skill": row["skill"],
                "missing_in_count": missing_in_jobs,
                "total_jobs": len(job_evaluations),
                "reason": f"Required by {missing_in_jobs} of your {len(job_evaluations)} target jobs."
            }

    return {
        "jobs": job_evaluations,
        "heatmap_matrix": heatmap_rows[:15], # Top 15 skills
        "best_fit": {
            "job_id": best_fit["job_id"],
            "title": f"{best_fit['company']} - {best_fit['title']}",
            "score": best_fit["job_readiness_score"],
            "reason": "You satisfy most critical must-have requirements with strong candidate evidence."
        } if best_fit else None,
        "best_growth": {
            "job_id": best_growth["job_id"],
            "title": f"{best_growth['company']} - {best_growth['title']}",
            "score": best_growth["job_readiness_score"],
            "reason": "Target role offers great growth. Completing a short learning roadmap makes you competitive."
        } if best_growth else None,
        "highest_value_skill": highest_val_skill
    }
