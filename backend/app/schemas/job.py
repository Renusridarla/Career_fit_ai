from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

class JobRequirements(BaseModel):
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    programming_languages: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    databases: List[str] = Field(default_factory=list)
    cloud: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    education_requirements: List[str] = Field(default_factory=list)
    experience_requirements: List[str] = Field(default_factory=list)
    responsibilities: List[str] = Field(default_factory=list)
    domain_requirements: List[str] = Field(default_factory=list)

class JobCreateRequest(BaseModel):
    company: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=20)
    url: Optional[str] = None
    location: Optional[str] = None

class JobResponse(BaseModel):
    id: str
    user_id: str
    company: str
    title: str
    description: str
    url: Optional[str] = None
    location: Optional[str] = None
    parsed_requirements: JobRequirements
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
