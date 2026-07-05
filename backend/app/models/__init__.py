# Import declarative base first
from app.models.base import Base

# Import all models to register them on the Base.metadata
from app.models.user import User
from app.models.case import ComplaintCase
from app.models.document import UploadedDocument
from app.models.intake import CaseIntakeResponse
from app.models.timeline import TimelineEvent
from app.models.output import ComplaintOutput
from app.models.log import ActivityLog

# Export all symbols for cleaner imports elsewhere
__all__ = [
    "Base",
    "User",
    "ComplaintCase",
    "UploadedDocument",
    "CaseIntakeResponse",
    "TimelineEvent",
    "ComplaintOutput",
    "ActivityLog"
]
