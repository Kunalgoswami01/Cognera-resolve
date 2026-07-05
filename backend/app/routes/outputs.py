from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.resolution import StoredDraftResponse
from app.services.resolution_service import ResolutionService
from app.services.case_service import CaseService

router = APIRouter()

@router.post(
    "/cases/{case_id}/outputs/complaint-draft",
    response_model=StoredDraftResponse,
    status_code=status.HTTP_200_OK
)
def generate_complaint_draft(
    case_id: str,
    db: Session = Depends(get_db)
):
    """
    Triggers Structured AI generation for a consumer dispute complaint draft.
    Uses case fields, document metadata, and intake context. Persists the result in complaint_outputs.
    """
    return ResolutionService.generate_draft(db=db, case_id=case_id)

@router.get(
    "/cases/{case_id}/outputs/complaint-draft",
    response_model=StoredDraftResponse,
    status_code=status.HTTP_200_OK
)
def get_complaint_draft(
    case_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieves the latest stored structured complaint draft for the case.
    Raises explicit 404 errors if the case doesn't exist or if no draft has been generated yet.
    """
    # Verify case exists first
    case = CaseService.get_case_by_id(db=db, case_id=case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID {case_id} not found"
        )

    latest_draft = ResolutionService.get_latest_draft(db=db, case_id=case_id)
    if not latest_draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint draft not found for this case"
        )

    return latest_draft
