from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.document import DocumentResponse
from app.services.document_service import DocumentService

# Note: The aggregate router prefix handles /api mounting
router = APIRouter()

@router.post("/cases/{case_id}/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_case_document(
    case_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    return DocumentService.save_file(db=db, case_id=case_id, file=file)

@router.get("/cases/{case_id}/documents", response_model=List[DocumentResponse])
def get_case_documents(
    case_id: str,
    db: Session = Depends(get_db)
):
    return DocumentService.get_case_documents(db=db, case_id=case_id)

@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    success = DocumentService.delete_document(db=db, document_id=document_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found"
        )
    return None
