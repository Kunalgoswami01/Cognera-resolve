from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.intake import StoredIntakeResponse
from app.services.intake_service import IntakeService
from app.services.case_service import CaseService

router = APIRouter()

@router.post(
    "/cases/{case_id}/intake/analyze", 
    response_model=StoredIntakeResponse, 
    status_code=status.HTTP_200_OK
)
def analyze_case_intake(
    case_id: str, 
    db: Session = Depends(get_db)
):
    """
    Run structured AI intake analysis on the specified consumer dispute case,
    validate the OpenAI response, persist it in the database, and return it.
    """
    return IntakeService.analyze_case(db=db, case_id=case_id)

@router.get(
    "/cases/{case_id}/intake", 
    response_model=StoredIntakeResponse, 
    status_code=status.HTTP_200_OK
)
def get_case_intake(
    case_id: str, 
    db: Session = Depends(get_db)
):
    """
    Retrieve the latest stored structured intake analysis for the specified case.
    Raises a 404 error if either the case doesn't exist or no analysis has been generated yet.
    """
    # Verify case exists first
    case = CaseService.get_case_by_id(db=db, case_id=case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID {case_id} not found"
        )
        
    latest_intake = IntakeService.get_latest_intake(db=db, case_id=case_id)
    if not latest_intake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intake analysis not found for this case"
        )


        
    return latest_intake
