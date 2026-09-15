import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from bson import ObjectId
from app.config.database import db_manager
from app.dependencies.auth import get_current_user
from app.schemas.resume import ParsedResumeData
from app.services.resume_generator import generate_pdf_resume, generate_docx_resume
from app.services.latex_generator import generate_latex_resume

router = APIRouter(prefix="/api/export", tags=["Resume Export"])

GENERATED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "generated")

@router.get("/{tailored_id}/pdf")
async def export_resume_pdf(tailored_id: str, current_user: dict = Depends(get_current_user)):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    try:
        doc = await db.tailored_resumes.find_one({"_id": ObjectId(tailored_id), "user_id": current_user["id"]})
    except Exception:
        doc = None

    if not doc:
        raise HTTPException(status_code=404, detail="Tailored resume not found.")

    resume_data = ParsedResumeData(**doc["resume_data"])
    filename = f"Tailored_Resume_{tailored_id}.pdf"
    file_path = os.path.abspath(os.path.join(GENERATED_DIR, filename))

    generate_pdf_resume(resume_data, file_path)

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/pdf"
    )

@router.get("/{tailored_id}/docx")
async def export_resume_docx(tailored_id: str, current_user: dict = Depends(get_current_user)):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    try:
        doc = await db.tailored_resumes.find_one({"_id": ObjectId(tailored_id), "user_id": current_user["id"]})
    except Exception:
        doc = None

    if not doc:
        raise HTTPException(status_code=404, detail="Tailored resume not found.")

    resume_data = ParsedResumeData(**doc["resume_data"])
    filename = f"Tailored_Resume_{tailored_id}.docx"
    file_path = os.path.abspath(os.path.join(GENERATED_DIR, filename))

    generate_docx_resume(resume_data, file_path)

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

@router.get("/{tailored_id}/latex")
async def export_resume_latex(tailored_id: str, current_user: dict = Depends(get_current_user)):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    try:
        doc = await db.tailored_resumes.find_one({"_id": ObjectId(tailored_id), "user_id": current_user["id"]})
    except Exception:
        doc = None

    if not doc:
        raise HTTPException(status_code=404, detail="Tailored resume not found.")

    resume_data = ParsedResumeData(**doc["resume_data"])
    filename = f"Tailored_Resume_{tailored_id}.tex"
    file_path = os.path.abspath(os.path.join(GENERATED_DIR, filename))
    os.makedirs(GENERATED_DIR, exist_ok=True)

    latex_code = generate_latex_resume(resume_data)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(latex_code)

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="text/x-tex"
    )

