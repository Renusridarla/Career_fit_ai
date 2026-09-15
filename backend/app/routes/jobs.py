from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from bson import ObjectId
from typing import List
from app.config.database import db_manager
from app.dependencies.auth import get_current_user
from app.schemas.job import JobCreateRequest, JobResponse
from app.services.jd_analyzer import analyze_job_description

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

@router.post("", response_model=JobResponse, status_code=201)
async def create_job_description(
    payload: JobCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    user_id = current_user["id"]
    
    # Extract requirements via AI / Heuristic analyzer
    parsed_reqs = await analyze_job_description(payload.description)

    now = datetime.utcnow()
    job_doc = {
        "user_id": user_id,
        "company": payload.company,
        "title": payload.title,
        "description": payload.description,
        "url": payload.url,
        "location": payload.location,
        "parsed_requirements": parsed_reqs.model_dump(),
        "created_at": now
    }

    result = await db.jobs.insert_one(job_doc)
    job_id = str(result.inserted_id)

    return JobResponse(
        id=job_id,
        user_id=user_id,
        company=payload.company,
        title=payload.title,
        description=payload.description,
        url=payload.url,
        location=payload.location,
        parsed_requirements=parsed_reqs,
        created_at=now
    )

@router.get("", response_model=List[JobResponse])
async def list_user_jobs(current_user: dict = Depends(get_current_user)):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    cursor = db.jobs.find({"user_id": current_user["id"]}).sort("created_at", -1)
    jobs = []
    async for doc in cursor:
        jobs.append(JobResponse(
            id=str(doc["_id"]),
            user_id=str(doc["user_id"]),
            company=doc["company"],
            title=doc["title"],
            description=doc["description"],
            url=doc.get("url"),
            location=doc.get("location"),
            parsed_requirements=doc.get("parsed_requirements", {}),
            created_at=doc.get("created_at", datetime.utcnow())
        ))
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
async def get_job_by_id(job_id: str, current_user: dict = Depends(get_current_user)):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    try:
        doc = await db.jobs.find_one({"_id": ObjectId(job_id), "user_id": current_user["id"]})
    except Exception:
        doc = None

    if not doc:
        raise HTTPException(status_code=404, detail="Job description not found.")

    return JobResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        company=doc["company"],
        title=doc["title"],
        description=doc["description"],
        url=doc.get("url"),
        location=doc.get("location"),
        parsed_requirements=doc.get("parsed_requirements", {}),
        created_at=doc.get("created_at", datetime.utcnow())
    )

@router.delete("/{job_id}")
async def delete_job(job_id: str, current_user: dict = Depends(get_current_user)):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    try:
        res = await db.jobs.delete_one({"_id": ObjectId(job_id), "user_id": current_user["id"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID.")

    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job description not found.")

    return {"message": "Job description deleted successfully."}
