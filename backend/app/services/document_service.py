import os
import uuid
import logging
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.models.case import ComplaintCase
from app.models.document import UploadedDocument

logger = logging.getLogger(__name__)

# Upload configuration parameters
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB in bytes
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp"
}
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}

class DocumentService:
    @staticmethod
    def validate_file(file: UploadFile):
        # 1. Validate MIME type
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {file.content_type}. Supported types are: PDF, PNG, JPG, JPEG, WEBP."
            )

        # 2. Validate file extension
        _, ext = os.path.splitext(file.filename.lower())
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file extension: {ext}. Supported extensions are: .pdf, .png, .jpg, .jpeg, .webp."
            )

    @staticmethod
    def save_file(db: Session, case_id: str, file: UploadFile):
        # 1. Verify case exists
        case = db.query(ComplaintCase).filter(ComplaintCase.id == case_id).first()
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID {case_id} not found"
            )

        # 2. Validate file properties (size & types)
        DocumentService.validate_file(file)

        # Read contents to check size (FastAPI UploadFile does not store size on the object initially)
        contents = file.file.read()
        file_size = len(contents)
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds the 10 MB limit (File size: {file_size / (1024*1024):.2f} MB)"
            )

        # Reset cursor back to start so uploader can write it if needed, or we write directly from memory
        file.file.seek(0)

        # 3. Formulate directory structure
        # Base folder path: backend/uploads/cases/{case_id}
        base_dir = os.path.join("uploads", "cases", case_id)
        os.makedirs(base_dir, exist_ok=True)

        # 4. Generate unique filename on disk to prevent collisions
        _, ext = os.path.splitext(file.filename.lower())
        unique_filename = f"{uuid.uuid4()}{ext}"
        target_path = os.path.join(base_dir, unique_filename)

        # Write binaries to disk
        try:
            with open(target_path, "wb") as f:
                f.write(contents)
        except Exception as e:
            logger.error(f"Failed to write file to disk: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save file to local disk."
            )

        # 5. Create database record
        db_doc = UploadedDocument(
            case_id=case_id,
            file_name=unique_filename,
            original_name=file.filename,
            mime_type=file.content_type,
            file_size=file_size,
            file_path=target_path,
            document_type="receipt",  # Default type
            extraction_status="pending"
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)
        return db_doc

    @staticmethod
    def get_case_documents(db: Session, case_id: str):
        # 1. Verify case exists
        case = db.query(ComplaintCase).filter(ComplaintCase.id == case_id).first()
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID {case_id} not found"
            )
        
        return db.query(UploadedDocument).filter(UploadedDocument.case_id == case_id).order_by(UploadedDocument.uploaded_at.desc()).all()

    @staticmethod
    def delete_document(db: Session, document_id: str):
        # 1. Find database record
        db_doc = db.query(UploadedDocument).filter(UploadedDocument.id == document_id).first()
        if not db_doc:
            return False

        # 2. Cleanup physical file from disk
        file_path = db_doc.file_path
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                logger.error(f"Failed to delete physical file {file_path}: {str(e)}")
                # We do not crash the request if file delete fails, but we log the incident.
        else:
            logger.warning(f"Physical file not found during deletion: {file_path}")

        # 3. Remove DB record
        db.delete(db_doc)
        db.commit()
        return True
