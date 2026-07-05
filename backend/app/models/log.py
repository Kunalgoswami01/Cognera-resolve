import uuid
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("complaint_cases.id", ondelete="CASCADE"), nullable=False)
    
    activity_type = Column(String(100), nullable=False) # e.g. case_created, doc_uploaded, analysis_run
    activity_message = Column(Text, nullable=False)
    metadata_json = Column(Text, nullable=True) # Extra debug or contextual meta info
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    case = relationship("ComplaintCase", back_populates="activity_logs")
