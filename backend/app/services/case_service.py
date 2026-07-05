from sqlalchemy.orm import Session
from app.models.case import ComplaintCase
from app.schemas.case import CaseCreate, CaseUpdate

class CaseService:
    @staticmethod
    def get_cases(db: Session, skip: int = 0, limit: int = 100):
        return db.query(ComplaintCase).order_by(ComplaintCase.created_at.desc()).offset(skip).limit(limit).all()


    @staticmethod
    def get_case_by_id(db: Session, case_id: str):
        return db.query(ComplaintCase).filter(ComplaintCase.id == case_id).first()

    @staticmethod
    def create_case(db: Session, case_in: CaseCreate):
        db_case = ComplaintCase(
            title=case_in.title,
            company_name=case_in.company_name,
            issue_category=case_in.issue_category,
            amount=case_in.amount,
            currency=case_in.currency,
            purchase_date=case_in.purchase_date,
            incident_date=case_in.incident_date,
            summary=case_in.summary,
            status="draft",
            current_step="case_created",
            readiness_score=10  # Initial readiness score for a created case
        )
        db.add(db_case)
        db.commit()
        db.refresh(db_case)
        return db_case

    @staticmethod
    def update_case(db: Session, case_id: str, case_in: CaseUpdate):
        db_case = db.query(ComplaintCase).filter(ComplaintCase.id == case_id).first()
        if not db_case:
            return None
        
        update_data = case_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_case, key, value)
            
        db.commit()
        db.refresh(db_case)
        return db_case

    @staticmethod
    def delete_case(db: Session, case_id: str):
        db_case = db.query(ComplaintCase).filter(ComplaintCase.id == case_id).first()
        if not db_case:
            return False
        
        db.delete(db_case)
        db.commit()
        return True
