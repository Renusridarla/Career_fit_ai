from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from bson import ObjectId
from app.config.database import db_manager
from app.dependencies.auth import get_current_user
from app.schemas.tailored_resume import TailoredResumeResponse, TailoredResumeUpdateRequest
from app.schemas.resume import ParsedResumeData
from app.schemas.job import JobRequirements
from app.services.resume_tailor import tailor_resume
from app.services.integrity_checker import audit_resume_integrity
from app.services.latex_generator import generate_latex_resume

router = APIRouter(prefix="/api/tailor", tags=["Resume Tailoring"])

@router.post("/{analysis_id}", response_model=TailoredResumeResponse, status_code=201)
async def generate_tailored_resume(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    user_id = current_user["id"]

    # 1. Fetch Analysis
    try:
        analysis_doc = await db.analyses.find_one({"_id": ObjectId(analysis_id), "user_id": user_id})
    except Exception:
        analysis_doc = None

    if not analysis_doc:
        raise HTTPException(status_code=404, detail="Job analysis report not found.")

    # 2. Fetch Master Resume
    resume_doc = await db.resumes.find_one({"_id": ObjectId(analysis_doc["resume_id"])})
    if not resume_doc:
        raise HTTPException(status_code=404, detail="Original master resume not found.")

    # 3. Fetch Job
    job_doc = await db.jobs.find_one({"_id": ObjectId(analysis_doc["job_id"])})
    if not job_doc:
        raise HTTPException(status_code=404, detail="Target job description not found.")

    original_resume = ParsedResumeData(**resume_doc["parsed_data"])
    job_reqs = JobRequirements(**job_doc["parsed_requirements"])
    missing_skills = analysis_doc.get("missing_skills", [])

    # 4. Tailor resume (strictly enforcing anti-fabrication)
    tailored_data, diffs = await tailor_resume(original_resume, job_reqs, missing_skills)

    # 5. Run 100% Resume Integrity Audit
    integrity_score, audit_report = audit_resume_integrity(original_resume, tailored_data, missing_skills)
    latex_code = generate_latex_resume(tailored_data)

    now = datetime.utcnow()
    tailored_doc = {
        "user_id": user_id,
        "analysis_id": analysis_id,
        "resume_data": tailored_data.model_dump(),
        "changes_made": [d.model_dump() for d in diffs],
        "integrity_score": integrity_score,
        "audit_report": audit_report,
        "file_paths": {},
        "created_at": now
    }

    result = await db.tailored_resumes.insert_one(tailored_doc)
    tailored_id = str(result.inserted_id)

    return TailoredResumeResponse(
        id=tailored_id,
        user_id=user_id,
        analysis_id=analysis_id,
        resume_data=tailored_data,
        changes_made=diffs,
        integrity_score=integrity_score,
        audit_report=audit_report,
        file_paths={},
        latex_code=latex_code,
        created_at=now
    )

@router.get("/{tailored_id}", response_model=TailoredResumeResponse)
async def get_tailored_resume(tailored_id: str, current_user: dict = Depends(get_current_user)):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    try:
        doc = await db.tailored_resumes.find_one({"_id": ObjectId(tailored_id), "user_id": current_user["id"]})
    except Exception:
        doc = None

    if not doc:
        raise HTTPException(status_code=404, detail="Tailored resume not found.")

    resume_data = ParsedResumeData(**doc.get("resume_data", {}))
    latex_code = generate_latex_resume(resume_data)

    return TailoredResumeResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        analysis_id=str(doc["analysis_id"]),
        resume_data=resume_data,
        changes_made=doc.get("changes_made", []),
        integrity_score=doc.get("integrity_score", 100.0),
        audit_report=doc.get("audit_report", []),
        file_paths=doc.get("file_paths", {}),
        latex_code=latex_code,
        created_at=doc.get("created_at", datetime.utcnow())
    )

@router.put("/{tailored_id}", response_model=TailoredResumeResponse)
async def update_tailored_resume(
    tailored_id: str,
    payload: TailoredResumeUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    try:
        res = await db.tailored_resumes.update_one(
            {"_id": ObjectId(tailored_id), "user_id": current_user["id"]},
            {"$set": {"resume_data": payload.resume_data.model_dump()}}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid tailored resume ID.")

    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tailored resume not found.")

    doc = await db.tailored_resumes.find_one({"_id": ObjectId(tailored_id)})
    resume_data = ParsedResumeData(**doc.get("resume_data", {}))
    latex_code = generate_latex_resume(resume_data)

    return TailoredResumeResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        analysis_id=str(doc["analysis_id"]),
        resume_data=resume_data,
        changes_made=doc.get("changes_made", []),
        integrity_score=doc.get("integrity_score", 100.0),
        audit_report=doc.get("audit_report", []),
        file_paths=doc.get("file_paths", {}),
        latex_code=latex_code,
        created_at=doc.get("created_at", datetime.utcnow())
    )
