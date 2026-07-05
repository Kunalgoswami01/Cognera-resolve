import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class ComplaintCase(Base):
    __tablename__ = "complaint_cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    title = Column(String(255), nullable=False)
    issue_category = Column(String(100), nullable=True)
    company_name = Column(String(255), nullable=False)
    amount = Column(Float, nullable=True)
    currency = Column(String(10), default="USD")
    purchase_date = Column(String(50), nullable=True) # Stored as string or date for simple parsing
    incident_date = Column(String(50), nullable=True)
    
    status = Column(String(50), default="draft")
    current_step = Column(String(100), default="case_created")
    readiness_score = Column(Integer, default=0)
    summary = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="cases")
    documents = relationship("UploadedDocument", back_populates="case", cascade="all, delete-orphan")
    intake_responses = relationship("CaseIntakeResponse", back_populates="case", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="case", cascade="all, delete-orphan")
    outputs = relationship("ComplaintOutput", back_populates="case", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="case", cascade="all, delete-orphan")
