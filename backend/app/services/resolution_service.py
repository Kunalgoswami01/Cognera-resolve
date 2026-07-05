import json
import logging
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from openai import OpenAI

from app.core.config import settings
from app.models.case import ComplaintCase
from app.models.document import UploadedDocument
from app.models.output import ComplaintOutput
from app.schemas.resolution import ComplaintDraft, StoredDraftResponse

logger = logging.getLogger(__name__)

class ResolutionService:
    @staticmethod
    def _build_drafting_context(
        case: ComplaintCase, 
        docs: List[UploadedDocument], 
        intake_output: Optional[ComplaintOutput]
    ) -> str:
        """
        Assembles all case fields, uploaded file metadata, and previously completed
        intake analysis context (if present) into a clean text prompt.
        """
        # Format document metadata
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

        # Process intake analysis context if available
        intake_context_str = ""
        if intake_output and intake_output.content_json:
            try:
                intake_data = json.loads(intake_output.content_json)
                intake_context_str = (
                    f"=== PRIOR INTAKE ANALYSIS ===\n"
                    f"Case Summary: {intake_data.get('case_summary', 'N/A')}\n"
                    f"Normalized Issue Category: {intake_data.get('normalized_issue_category', 'N/A')}\n"
                    f"Extracted Facts: {json.dumps(intake_data.get('extracted_facts', {}), indent=2)}\n"
                    f"Missing Details Flagged: {json.dumps(intake_data.get('missing_information', []), indent=2)}\n\n"
                )
            except Exception as parse_err:
                logger.warning(f"Failed to parse intake output content_json: {parse_err}")
                intake_context_str = "=== PRIOR INTAKE ANALYSIS ===\n(Failed to parse previous intake analysis JSON. Relying on raw case facts only.)\n\n"
        else:
            intake_context_str = "=== PRIOR INTAKE ANALYSIS ===\nNo prior intake analysis is available for this case. Generating draft directly from raw case facts and document metadata.\n\n"

        context = (
            f"{intake_context_str}"
            f"=== RAW CASE DETAILS ===\n"
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
    def _build_drafting_prompts(context_str: str) -> tuple[str, str]:
        """
        Formats the system and user prompts for draft generation, enforcing document metadata safety.
        """
        system_prompt = (
            "You are an AI complaint drafting assistant for Cognera Resolve.\n"
            "Your objective is to generate a professional, practical consumer complaint or escalation letter "
            "based on the provided case details and document metadata.\n\n"
            "CRITICAL BEHAVIOR RULES:\n"
            "1. NO LEGAL ADVICE: Provide a practical consumer escalation letter/draft suitable for sending to customer support, "
            "grievance teams, or executive escalations. Keep the tone professional, objective, firm, and polite. "
            "Write as a consumer support assistant, not a legal firm, unless specifically requested.\n"
            "2. WEAK CONTEXT FOR DOCUMENTS: Uploaded document metadata is weak context only. You must NOT treat "
            "filenames or MIME types as confirmed proof of document contents. For example, if a file is named 'receipt.pdf', "
            "you can mention that a receipt has been uploaded and is available in the case evidence vault, but you must NOT "
            "state that the receipt's contents or the purchase proof is definitively confirmed since no OCR or document content extraction "
            "is performed in this step. You must not describe any specific contents of the files unless the user explicitly stated them in the case text.\n"

            "3. NO HALLUCINATIONS: Do not fabricate exact order references, confirmation IDs, dates, or contact info. "
            "If details are missing, leave placeholders (e.g. '[Order Number]') or explain in the missing_disclaimer.\n"
            "4. DEMAND RESOLUTION: State the requested resolution clearly based on case facts (e.g., refund, replacement, cancellation). "
            "If the desired outcome is not explicitly stated, infer cautiously (e.g., requesting a full refund of the amount) and "
            "note it in the missing_disclaimer.\n"
            "5. OUTPUT FORMAT: Output strictly a JSON object matching the requested schema. The `draft_markdown` field must contain the "
            "complete formatted complaint letter. Start the letter directly with a formal salutation (e.g., 'Dear Customer Relations Team,') "
            "and sign off appropriately (e.g., 'Sincerely, [Consumer Name]')."
        )

        user_prompt = (
            f"Below is the case context, metadata, and prior analysis. Please compile a professional complaint "
            f"escalation draft following the rules.\n\n"
            f"{context_str}"
        )

        return system_prompt, user_prompt

    @staticmethod
    def _call_openai(system_prompt: str, user_prompt: str) -> ComplaintDraft:
        """
        Executes the OpenAI API call using Structured Output Parsing. Falls back to JSON mode + Pydantic validation if needed.
        """
        if not settings.OPENAI_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OpenAI API Key is not configured. Please set the OPENAI_API_KEY environment variable."
            )

        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            logger.info("Attempting OpenAI Structured Output parsing for complaint draft...")
            response = client.beta.chat.completions.parse(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format=ComplaintDraft,
                temperature=0.3
            )
            parsed_result = response.choices[0].message.parsed
            if parsed_result is None:
                raise ValueError("Structured parsing returned empty model.")
            return parsed_result

        except Exception as parse_error:
            logger.warning(f"Structured Output parsing for draft failed or unsupported: {parse_error}. Falling back to JSON mode.")
            try:
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                response = client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt + "\nOutput strictly as a valid JSON object matching the requested schema structure."},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.3
                )
                raw_content = response.choices[0].message.content
                if not raw_content:
                    raise ValueError("Empty response received from OpenAI.")
                data = json.loads(raw_content)
                return ComplaintDraft.model_validate(data)
            except Exception as fallback_error:
                logger.error(f"Fallback JSON mode failed for drafting: {fallback_error}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Complaint drafting failed during AI generation: {str(fallback_error)}"
                )

    @staticmethod
    def _persist_complaint_draft(db: Session, case_id: str, draft: ComplaintDraft) -> ComplaintOutput:
        """
        Saves the generated draft inside the database under complaint_outputs.
        Overwrites existing draft and increments its version.
        """
        db_output = db.query(ComplaintOutput).filter(
            ComplaintOutput.case_id == case_id,
            ComplaintOutput.output_type == "complaint_draft"
        ).first()

        if db_output:
            db_output.content_json = draft.model_dump_json()
            db_output.version += 1
            db_output.generated_by = "resolution_agent"
            db_output.created_at = datetime.utcnow()
        else:
            db_output = ComplaintOutput(
                case_id=case_id,
                output_type="complaint_draft",
                content_json=draft.model_dump_json(),
                version=1,
                generated_by="resolution_agent"
            )
            db.add(db_output)

        try:
            db.commit()
            db.refresh(db_output)
            return db_output
        except Exception as db_error:
            db.rollback()
            logger.error(f"Failed to persist complaint draft in DB: {db_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Successfully generated draft, but failed to save it to database."
            )

    @classmethod
    def generate_draft(cls, db: Session, case_id: str) -> StoredDraftResponse:
        """
        Triggers AI generation for the complaint draft and persists the wrapper.
        """
        case = db.query(ComplaintCase).filter(ComplaintCase.id == case_id).first()
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID {case_id} not found"
            )

        # Retrieve prior intake analysis (if available)
        intake_output = db.query(ComplaintOutput).filter(
            ComplaintOutput.case_id == case_id,
            ComplaintOutput.output_type == "intake_analysis"
        ).first()

        context_str = cls._build_drafting_context(case, case.documents, intake_output)
        system_prompt, user_prompt = cls._build_drafting_prompts(context_str)
        draft_data = cls._call_openai(system_prompt, user_prompt)
        persisted_output = cls._persist_complaint_draft(db, case_id, draft_data)

        return StoredDraftResponse(
            draft=draft_data,
            version=persisted_output.version,
            generated_at=persisted_output.created_at
        )

    @classmethod
    def get_latest_draft(cls, db: Session, case_id: str) -> Optional[StoredDraftResponse]:
        """
        Fetches the latest stored complaint draft.
        """
        db_output = db.query(ComplaintOutput).filter(
            ComplaintOutput.case_id == case_id,
            ComplaintOutput.output_type == "complaint_draft"
        ).first()

        if not db_output or not db_output.content_json:
            return None

        try:
            draft_data = ComplaintDraft.model_validate_json(db_output.content_json)
            return StoredDraftResponse(
                draft=draft_data,
                version=db_output.version,
                generated_at=db_output.created_at
            )
        except Exception as parse_error:
            logger.error(f"Stored complaint draft failed to parse: {parse_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Stored complaint draft is malformed and could not be loaded."
            )
