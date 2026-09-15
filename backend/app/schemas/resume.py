from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

class PersonalInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""
    portfolio: str = ""

class EducationItem(BaseModel):
    degree: str = ""
    institution: str = ""
    field: str = ""
    graduation_year: str = ""
    cgpa: str = ""

class SkillsCategorized(BaseModel):
    programming_languages: List[str] = Field(default_factory=list)
    frontend: List[str] = Field(default_factory=list)
    backend: List[str] = Field(default_factory=list)
    databases: List[str] = Field(default_factory=list)
    cloud: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    other: List[str] = Field(default_factory=list)

class ExperienceItem(BaseModel):
    company: str = ""
    role: str = ""
    dates: str = ""
    responsibilities: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)

class ProjectItem(BaseModel):
    name: str = ""
    description: str = ""
    technologies: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)

class ParsedResumeData(BaseModel):
    summary: str = ""
    personal: PersonalInfo = Field(default_factory=PersonalInfo)
    education: List[EducationItem] = Field(default_factory=list)
    skills: SkillsCategorized = Field(default_factory=SkillsCategorized)
    experience: List[ExperienceItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)

class ResumeResponse(BaseModel):
    id: str
    user_id: str
    original_filename: str
    parsed_data: ParsedResumeData
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResumeUpdateRequest(BaseModel):
    parsed_data: ParsedResumeData
