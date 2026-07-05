from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class CaseBase(BaseModel):
    title: str
    company_name: str
    issue_category: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = "USD"
    purchase_date: Optional[str] = None
    incident_date: Optional[str] = None
    summary: Optional[str] = None

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    company_name: Optional[str] = None
    issue_category: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    purchase_date: Optional[str] = None
    incident_date: Optional[str] = None
    status: Optional[str] = None
    current_step: Optional[str] = None
    readiness_score: Optional[int] = None
    summary: Optional[str] = None

class CaseResponse(CaseBase):
    id: str
    user_id: Optional[str] = None
    status: str
    current_step: str
    readiness_score: int
    created_at: datetime
    updated_at: datetime

    # Enable reading from SQLAlchemy objects
    model_config = ConfigDict(from_attributes=True)
