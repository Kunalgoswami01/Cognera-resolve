import uuid
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("complaint_cases.id", ondelete="CASCADE"), nullable=False)
    
    event_date = Column(String(50), nullable=True) # Event date from documents or input
    event_type = Column(String(100), nullable=False) # e.g. transaction, contact, response
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    source = Column(String(100), nullable=True) # e.g. receipt.pdf, user_input
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    case = relationship("ComplaintCase", back_populates="timeline_events")
