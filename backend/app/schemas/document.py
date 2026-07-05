from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class DocumentResponse(BaseModel):
    id: str
    case_id: str
    original_name: str
    mime_type: str
    file_size: int
    document_type: str
    extraction_status: str
    uploaded_at: datetime

    # Enable reading from SQLAlchemy objects
    model_config = ConfigDict(from_attributes=True)
