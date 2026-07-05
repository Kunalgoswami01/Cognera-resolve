import uuid
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("complaint_cases.id", ondelete="CASCADE"), nullable=False)
    
    file_name = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_path = Column(String(512), nullable=False)
    document_type = Column(String(100), default="receipt") # e.g. receipt, terms, support_chat
    
    extracted_text = Column(Text, nullable=True)
    extraction_status = Column(String(50), default="pending") # e.g. pending, completed, failed

    uploaded_at = Column(DateTime, server_default=func.now())

    # Relationships
    case = relationship("ComplaintCase", back_populates="documents")
