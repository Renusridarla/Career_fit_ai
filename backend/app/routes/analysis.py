from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from bson import ObjectId
from typing import List
from app.config.database import db_manager
from app.dependencies.auth import get_current_user
from app.schemas.analysis import AnalysisResponse, CategoryScores
from app.schemas.resume import ParsedResumeData
from app.schemas.job import JobRequirements
from app.services.matching_engine import calculate_match_scores
from app.services.readiness_engine import evaluate_job_readiness
from app.services.project_recommender import recommend_unified_project
from app.services.gap_analyzer import analyze_skill_gaps
from app.services.recommendation_engine import generate_recommendations

router = APIRouter(prefix="/api/analysis", tags=["Resume-Job Analysis"])

@router.post("/{job_id}", response_model=AnalysisResponse, status_code=201)
async def analyze_resume_for_job(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    user_id = current_user["id"]

    # 1. Fetch user's Master Resume
    resume_doc = await db.resumes.find_one({"user_id": user_id})
    if not resume_doc:
        raise HTTPException(
            status_code=400,
            detail="Master resume not found. Please upload your Master Resume first before analyzing job descriptions."
        )

    # 2. Fetch Job Description
    try:
        job_doc = await db.jobs.find_one({"_id": ObjectId(job_id), "user_id": user_id})
    except Exception:
        job_doc = None

    if not job_doc:
        raise HTTPException(status_code=404, detail="Job description not found.")

    resume = ParsedResumeData(**resume_doc["parsed_data"])
    job_reqs = JobRequirements(**job_doc["parsed_requirements"])

    # 3. Calculate Scores & Evidence Matching
    overall_score, cat_scores, matched, partial, missing, evidence = calculate_match_scores(resume, job_reqs)

    # 4. Evaluate Job Readiness, Dual Scores, Decision Engine, Evidence Matrix
    readiness_res = evaluate_job_readiness(resume, job_reqs)

    # 5. Single Unified Project Recommendation
    proj_rec = recommend_unified_project(resume, job_reqs, missing)

    # 6. Learning Plan & Recommendations
    learning_plan = analyze_skill_gaps(resume, job_reqs, missing)
    recommendations = generate_recommendations(resume, job_reqs, matched, missing)

    now = datetime.utcnow()
    analysis_doc = {
        "user_id": user_id,
        "resume_id": str(resume_doc["_id"]),
        "job_id": job_id,
        "job_title": job_doc.get("title", ""),
        "company": job_doc.get("company", ""),
        "ats_score": readiness_res["ats_score"],
        "job_readiness_score": readiness_res["job_readiness_score"],
        "overall_score": overall_score,
        "decision": readiness_res["decision"],
        "decision_rationale": readiness_res["decision_rationale"],
        "prep_time_estimate": readiness_res["prep_time_estimate"],
        "category_scores": cat_scores.model_dump(),
        "matched_skills": matched,
        "partial_matches": partial,
        "missing_skills": missing,
        "top_blockers": readiness_res["top_blockers"],
        "why_match": readiness_res["why_match"],
        "why_not_match": readiness_res["why_not_match"],
        "coverage_matrix": readiness_res["coverage_matrix"],
        "project_recommendation": proj_rec,
        "role_resume_requirements": readiness_res.get("role_resume_requirements", {}),
        "evidence": [item.model_dump() for item in evidence],
        "recommendations": recommendations,
        "learning_plan": [item.model_dump() for item in learning_plan],
        "created_at": now
    }

    result = await db.analyses.insert_one(analysis_doc)
    analysis_id = str(result.inserted_id)

    return AnalysisResponse(
        id=analysis_id,
        user_id=user_id,
        resume_id=str(resume_doc["_id"]),
        job_id=job_id,
        job_title=job_doc.get("title", ""),
        company=job_doc.get("company", ""),
        ats_score=readiness_res["ats_score"],
        job_readiness_score=readiness_res["job_readiness_score"],
        overall_score=overall_score,
        decision=readiness_res["decision"],
        decision_rationale=readiness_res["decision_rationale"],
        prep_time_estimate=readiness_res["prep_time_estimate"],
        category_scores=cat_scores,
        matched_skills=matched,
        partial_matches=partial,
        missing_skills=missing,
        top_blockers=readiness_res["top_blockers"],
        why_match=readiness_res["why_match"],
        why_not_match=readiness_res["why_not_match"],
        coverage_matrix=readiness_res["coverage_matrix"],
        project_recommendation=proj_rec,
        role_resume_requirements=readiness_res.get("role_resume_requirements", {}),
        evidence=evidence,
        recommendations=recommendations,
        learning_plan=learning_plan,
        created_at=now
    )

@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis_by_id(analysis_id: str, current_user: dict = Depends(get_current_user)):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    try:
        doc = await db.analyses.find_one({"_id": ObjectId(analysis_id), "user_id": current_user["id"]})
    except Exception:
        doc = None

    if not doc:
        raise HTTPException(status_code=404, detail="Analysis report not found.")

    return AnalysisResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        resume_id=str(doc["resume_id"]),
        job_id=str(doc["job_id"]),
        job_title=doc.get("job_title", ""),
        company=doc.get("company", ""),
        ats_score=doc.get("ats_score", doc.get("overall_score", 0.0)),
        job_readiness_score=doc.get("job_readiness_score", doc.get("overall_score", 0.0)),
        overall_score=doc.get("overall_score", 0.0),
        decision=doc.get("decision", "PREPARE FIRST"),
        decision_rationale=doc.get("decision_rationale", ""),
        prep_time_estimate=doc.get("prep_time_estimate", ""),
        category_scores=CategoryScores(**doc.get("category_scores", {})),
        matched_skills=doc.get("matched_skills", []),
        partial_matches=doc.get("partial_matches", []),
        missing_skills=doc.get("missing_skills", []),
        top_blockers=doc.get("top_blockers", []),
        why_match=doc.get("why_match", []),
        why_not_match=doc.get("why_not_match", []),
        coverage_matrix=doc.get("coverage_matrix", []),
        project_recommendation=doc.get("project_recommendation", {}),
        role_resume_requirements=doc.get("role_resume_requirements", {}),
        evidence=doc.get("evidence", []),
        recommendations=doc.get("recommendations", []),
        learning_plan=doc.get("learning_plan", []),
        created_at=doc.get("created_at", datetime.utcnow())
    )

@router.delete("/{analysis_id}")
async def delete_analysis(analysis_id: str, current_user: dict = Depends(get_current_user)):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    try:
        res = await db.analyses.delete_one({"_id": ObjectId(analysis_id), "user_id": current_user["id"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid analysis ID.")

    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Analysis report not found.")

    return {"message": "Analysis report deleted successfully."}
