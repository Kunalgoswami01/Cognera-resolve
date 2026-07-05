import json
import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException, status
from openai import OpenAI


from app.core.config import settings
from app.models.case import ComplaintCase
from app.models.document import UploadedDocument
from app.models.output import ComplaintOutput
from app.schemas.intake import IntakeAnalysis, StoredIntakeResponse

logger = logging.getLogger(__name__)

class IntakeService:
    @staticmethod
    def _build_case_context(case: ComplaintCase, docs: List[UploadedDocument]) -> str:
        """
        Builds a comprehensive text context of the case details and document metadata.
        """
        doc_list_str = ""
        if docs:
            for idx, doc in enumerate(docs, 1):
                doc_list_str += (
                    f"Document {idx}:\n"
                    f"  - Original Name: {doc.original_name}\n"
                    f"  - MIME Type: {doc.mime_type}\n"
                    f"  - Document Type: {doc.document_type or 'unknown'}\n"
                    f"  - Uploaded At: {doc.uploaded_at.isoformat() if doc.uploaded_at else 'unknown'}\n"
                )
        else:
            doc_list_str = "No documents uploaded."

        context = (
            f"=== CASE DETAILS ===\n"
            f"Title: {case.title}\n"
            f"Company Name: {case.company_name}\n"
            f"Issue Category: {case.issue_category or 'unknown'}\n"
            f"Summary/Description: {case.summary or 'No summary provided.'}\n"
            f"Disputed Amount: {case.amount if case.amount is not None else 'unknown'} {case.currency or 'USD'}\n"
            f"Purchase Date: {case.purchase_date or 'unknown'}\n"
            f"Incident Date: {case.incident_date or 'unknown'}\n"
            f"Current Status: {case.status or 'draft'}\n"
            f"Current Step: {case.current_step or 'case_created'}\n"
            f"Readiness Score: {case.readiness_score or 0}/100\n\n"
            f"=== UPLOADED DOCUMENTS METADATA ===\n"
            f"{doc_list_str}\n"
        )
        return context

    @staticmethod
    def _build_ai_prompts(context_str: str) -> tuple[str, str]:
        """
        Generates the system and user prompts for OpenAI.
        """
        system_prompt = (
            "You are an AI complaint intake assistant for Cognera Resolve.\n"
            "Your objective is to analyze a consumer dispute case and its associated document metadata, "
            "then produce a structured intake assessment.\n\n"
            "CRITICAL BEHAVIOR RULES:\n"
            "1. DO NOT FABRICATE FACTS (HALLUCINATE). If a fact is unknown or not explicitly provided in the case text, "
            "leave it as null/unknown and flag it as missing.\n"
            "2. WEAK CONTEXT FOR DOCUMENTS: Uploaded document metadata (filenames, MIME types, etc.) is weak context only. "
            "Filenames and MIME types are hints, not confirmed proof of document contents. For example, if a file is named "
            "'receipt.pdf', you may infer that proof of purchase likely exists in the evidence vault, but you must NOT "
            "state that the receipt's contents or the purchase proof is definitively confirmed since no OCR or document content extraction "
            "is performed in this step. You must not describe any specific contents of the files unless the user explicitly stated them in the case text.\n"
            "3. INFER CAUTIOUSLY: Only draw direct, logical conclusions from explicit case text.\n"
            "4. NO LEGAL ADVICE: Provide practical, conversational help to prepare the consumer's complaint. "
            "Focus on completeness, facts, and clarity. Speak as a friendly intake assistant, not a legal robot.\n"
            "5. CONSTRAIN VALUES: Ensure 'priority' fields are strictly 'high', 'medium', or 'low'. "
            "Ensure 'normalized_issue_category' fits one of the allowed schema enums."

        )

        user_prompt = (
            f"Below is the case information and uploaded files metadata. Please analyze this case "
            f"and provide the structured intake analysis JSON.\n\n"
            f"{context_str}"
        )

        return system_prompt, user_prompt

    @staticmethod
    def _call_openai(system_prompt: str, user_prompt: str) -> IntakeAnalysis:
        """
        Executes the OpenAI API call using Structured Output Parsing. Falls back to JSON mode if needed.
        """
        if not settings.OPENAI_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OpenAI API Key is not configured. Please set the OPENAI_API_KEY environment variable."
            )

        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            
            # Use beta parsing capabilities of the SDK
            logger.info("Attempting OpenAI Structured Output parsing...")
            response = client.beta.chat.completions.parse(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format=IntakeAnalysis,
                temperature=0.0
            )
            parsed_result = response.choices[0].message.parsed
            
            if parsed_result is None:
                raise ValueError("Structured parsing returned empty model.")
                
            return parsed_result

        except Exception as parse_error:
            logger.warning(f"Structured Output parsing failed or unsupported: {parse_error}. Falling back to JSON mode.")
            # Fallback to standard JSON Mode
            try:
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                response = client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt + "\nOutput strictly as a valid JSON object matching the requested schema structure."},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.0
                )
                raw_content = response.choices[0].message.content
                if not raw_content:
                    raise ValueError("Empty response received from OpenAI.")
                
                data = json.loads(raw_content)
                return IntakeAnalysis.model_validate(data)
                
            except Exception as fallback_error:
                logger.error(f"Fallback JSON mode failed: {fallback_error}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Intake analysis failed during AI generation: {str(fallback_error)}"
                )

    @staticmethod
    def _persist_intake_analysis(db: Session, case_id: str, analysis: IntakeAnalysis) -> ComplaintOutput:
        """
        Persists the intake analysis results in the database under complaint_outputs.
        Updates existing analysis if one already exists.
        """
        db_output = db.query(ComplaintOutput).filter(
            ComplaintOutput.case_id == case_id,
            ComplaintOutput.output_type == "intake_analysis"
        ).first()

        if db_output:
            db_output.content_json = analysis.model_dump_json()
            db_output.version += 1
            db_output.generated_by = "intake_agent"
            db_output.created_at = datetime.utcnow()
        else:

            db_output = ComplaintOutput(
                case_id=case_id,
                output_type="intake_analysis",
                content_json=analysis.model_dump_json(),
                version=1,
                generated_by="intake_agent"
            )
            db.add(db_output)

        try:
            db.commit()
            db.refresh(db_output)
            return db_output
        except Exception as db_error:
            db.rollback()
            logger.error(f"Failed to persist intake analysis in DB: {db_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Successfully ran analysis, but failed to save it to database."
            )

    @classmethod
    def analyze_case(cls, db: Session, case_id: str) -> StoredIntakeResponse:
        """
        Orchestrates the entire intake analysis workflow: retrieves case facts/docs,
        calls the OpenAI model, persists the outcome, and returns a wrapped response.
        """
        case = db.query(ComplaintCase).filter(ComplaintCase.id == case_id).first()
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID {case_id} not found"
            )

        context_str = cls._build_case_context(case, case.documents)
        system_prompt, user_prompt = cls._build_ai_prompts(context_str)
        analysis_data = cls._call_openai(system_prompt, user_prompt)
        persisted_output = cls._persist_intake_analysis(db, case_id, analysis_data)

        return StoredIntakeResponse(
            analysis=analysis_data,
            version=persisted_output.version,
            generated_at=persisted_output.created_at
        )

    @classmethod
    def get_latest_intake(cls, db: Session, case_id: str) -> Optional[StoredIntakeResponse]:
        """
        Retrieves the latest stored intake analysis for a case.
        """
        db_output = db.query(ComplaintOutput).filter(
            ComplaintOutput.case_id == case_id,
            ComplaintOutput.output_type == "intake_analysis"
        ).first()

        if not db_output or not db_output.content_json:
            return None

        try:
            analysis_data = IntakeAnalysis.model_validate_json(db_output.content_json)
            return StoredIntakeResponse(
                analysis=analysis_data,
                version=db_output.version,
                generated_at=db_output.created_at
            )
        except Exception as parse_error:
            logger.error(f"Stored intake analysis failed to parse: {parse_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Stored intake analysis is malformed and could not be loaded."
            )
