import uuid
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class CaseIntakeResponse(Base):
    __tablename__ = "case_intake_responses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("complaint_cases.id", ondelete="CASCADE"), nullable=False)
    
    question_key = Column(String(100), nullable=False)
    question_text = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=False)
    source = Column(String(50), default="user_form") # e.g. user_chat, user_form, document_extraction
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    case = relationship("ComplaintCase", back_populates="intake_responses")
