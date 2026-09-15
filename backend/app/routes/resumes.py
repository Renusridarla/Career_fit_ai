from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from datetime import datetime
from bson import ObjectId
from typing import List, Optional
from app.config.database import db_manager
from app.dependencies.auth import get_current_user
from app.schemas.resume import ResumeResponse, ResumeUpdateRequest
from app.utils.file_utils import extract_resume_text
from app.services.resume_parser import parse_resume_text

router = APIRouter(prefix="/api/resumes", tags=["Master Resume"])

@router.post("/upload", response_model=ResumeResponse)
async def upload_master_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    user_id = current_user["id"]
    
    # Extract text from file
    raw_text = extract_resume_text(file)
    
    # AI Structured Parsing
    parsed_data = await parse_resume_text(raw_text)

    now = datetime.utcnow()
    resume_doc = {
        "user_id": user_id,
        "original_filename": file.filename,
        "raw_text": raw_text,
        "parsed_data": parsed_data.model_dump(),
        "created_at": now,
        "updated_at": now
    }

    # Store or update master resume for user
    existing = await db.resumes.find_one({"user_id": user_id})
    if existing:
        await db.resumes.update_one(
            {"_id": existing["_id"]},
            {"$set": resume_doc}
        )
        resume_id = str(existing["_id"])
        created_at = existing.get("created_at", now)
    else:
        result = await db.resumes.insert_one(resume_doc)
        resume_id = str(result.inserted_id)
        created_at = now

    return ResumeResponse(
        id=resume_id,
        user_id=user_id,
        original_filename=file.filename,
        parsed_data=parsed_data,
        created_at=created_at,
        updated_at=now
    )

@router.get("", response_model=Optional[ResumeResponse])
async def get_master_resume(current_user: dict = Depends(get_current_user)):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    user_id = current_user["id"]
    doc = await db.resumes.find_one({"user_id": user_id})
    if not doc:
        return None

    return ResumeResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        original_filename=doc.get("original_filename", "resume.pdf"),
        parsed_data=doc.get("parsed_data", {}),
        created_at=doc.get("created_at", datetime.utcnow()),
        updated_at=doc.get("updated_at", datetime.utcnow())
    )

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume_by_id(resume_id: str, current_user: dict = Depends(get_current_user)):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    try:
        doc = await db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": current_user["id"]})
    except Exception:
        doc = None

    if not doc:
        raise HTTPException(status_code=404, detail="Resume not found.")

    return ResumeResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        original_filename=doc.get("original_filename", "resume.pdf"),
        parsed_data=doc.get("parsed_data", {}),
        created_at=doc.get("created_at", datetime.utcnow()),
        updated_at=doc.get("updated_at", datetime.utcnow())
    )

@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume_data(
    resume_id: str,
    payload: ResumeUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    now = datetime.utcnow()
    try:
        res = await db.resumes.update_one(
            {"_id": ObjectId(resume_id), "user_id": current_user["id"]},
            {"$set": {"parsed_data": payload.parsed_data.model_dump(), "updated_at": now}}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resume ID.")

    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Resume not found or unauthorized.")

    doc = await db.resumes.find_one({"_id": ObjectId(resume_id)})
    return ResumeResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        original_filename=doc.get("original_filename", "resume.pdf"),
        parsed_data=doc.get("parsed_data", {}),
        created_at=doc.get("created_at", now),
        updated_at=now
    )

@router.delete("/{resume_id}")
async def delete_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    try:
        res = await db.resumes.delete_one({"_id": ObjectId(resume_id), "user_id": current_user["id"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resume ID.")

    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resume not found.")

    return {"message": "Master resume deleted successfully."}
