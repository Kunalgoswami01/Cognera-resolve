import uuid
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class ComplaintOutput(Base):
    __tablename__ = "complaint_outputs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("complaint_cases.id", ondelete="CASCADE"), nullable=False)
    
    output_type = Column(String(100), nullable=False) # e.g. letter, email, CFPB_complaint
    content_markdown = Column(Text, nullable=True)
    content_json = Column(Text, nullable=True) # JSON encoded details like legal ground bases
    version = Column(Integer, default=1)
    generated_by = Column(String(100), default="resolution_agent")
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    case = relationship("ComplaintCase", back_populates="outputs")
