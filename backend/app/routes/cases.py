from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse
from app.services.case_service import CaseService

router = APIRouter()

@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(case_in: CaseCreate, db: Session = Depends(get_db)):
    return CaseService.create_case(db=db, case_in=case_in)

@router.get("", response_model=List[CaseResponse])
def read_cases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return CaseService.get_cases(db=db, skip=skip, limit=limit)

@router.get("/{case_id}", response_model=CaseResponse)
def read_case(case_id: str, db: Session = Depends(get_db)):
    db_case = CaseService.get_case_by_id(db=db, case_id=case_id)
    if not db_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID {case_id} not found"
        )
    return db_case

@router.patch("/{case_id}", response_model=CaseResponse)
def update_case(case_id: str, case_in: CaseUpdate, db: Session = Depends(get_db)):
    db_case = CaseService.update_case(db=db, case_id=case_id, case_in=case_in)
    if not db_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID {case_id} not found"
        )
    return db_case

@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case(case_id: str, db: Session = Depends(get_db)):
    success = CaseService.delete_case(db=db, case_id=case_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID {case_id} not found"
        )
    return None
