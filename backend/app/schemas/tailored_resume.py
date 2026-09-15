from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.schemas.resume import ParsedResumeData

class DiffItem(BaseModel):
    section: str
    original: str
    tailored: str
    rationale: str

class TailoredResumeResponse(BaseModel):
    id: str
    user_id: str
    analysis_id: str
    resume_data: ParsedResumeData
    changes_made: List[DiffItem] = Field(default_factory=list)
    integrity_score: float = 100.0
    audit_report: List[Dict[str, Any]] = Field(default_factory=list)
    file_paths: Dict[str, str] = Field(default_factory=dict)
    latex_code: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TailoredResumeUpdateRequest(BaseModel):
    resume_data: ParsedResumeData
