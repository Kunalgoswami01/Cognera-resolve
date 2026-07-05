from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class ExtractedFacts(BaseModel):
    company_name: Optional[str] = Field(
        default=None, 
        description="Name of the company or merchant involved in the dispute"
    )
    product_or_service: Optional[str] = Field(
        default=None, 
        description="The specific product or service purchased or contested"
    )
    purchase_date: Optional[str] = Field(
        default=None, 
        description="Date of purchase or transaction (if known, keep as string/text)"
    )
    incident_date: Optional[str] = Field(
        default=None, 
        description="Date when the issue occurred or was discovered"
    )
    amount: Optional[float] = Field(
        default=None, 
        description="Disputed amount, represented as a numeric value"
    )
    order_reference_if_known: Optional[str] = Field(
        default=None, 
        description="Order number, invoice reference, confirmation ID, etc."
    )
    issue_description: Optional[str] = Field(
        default=None, 
        description="A clear summary of what went wrong"
    )
    customer_goal_if_known: Optional[str] = Field(
        default=None, 
        description="The customer's desired outcome (e.g. refund, replacement, billing adjustment)"
    )

class MissingInfoItem(BaseModel):
    key: str = Field(
        description="Unique camelCase or snake_case key representing the missing field, e.g. purchaseDate or incidentDate"
    )
    label: str = Field(
        description="A user-friendly label for the missing field, e.g., 'Purchase Date'"
    )
    reason: str = Field(
        description="Explanation of why this information is needed for the dispute"
    )
    priority: Literal["high", "medium", "low"] = Field(
        description="Priority level: high, medium, or low"
    )
    suggested_user_prompt: str = Field(
        description="A friendly, conversational prompt to ask the user for this specific detail"
    )

class EvidenceAssessment(BaseModel):
    uploaded_documents_count: int = Field(
        description="Count of files uploaded for this case"
    )
    likely_evidence_present: List[str] = Field(
        description="List of evidence types likely present in the uploaded files based on metadata (e.g., proof of purchase)"
    )
    likely_evidence_missing: List[str] = Field(
        description="List of recommended evidence types that are missing (e.g. receipt, terms, email exchange)"
    )
    notes: Optional[str] = Field(
        default=None, 
        description="Any additional assessment or observations about the provided evidence"
    )

class IntakeAnalysis(BaseModel):
    case_summary: str = Field(
        description="Concise, plain-language complaint summary"
    )
    normalized_issue_category: Literal[
        "refund_delay",
        "defective_product",
        "warranty_claim",
        "billing_dispute",
        "delivery_issue",
        "subscription_problem",
        "service_quality_issue",
        "other"
    ] = Field(
        description="Categorization of the issue"
    )
    extracted_facts: ExtractedFacts = Field(
        description="Extracted key facts from the case information"
    )
    missing_information: List[MissingInfoItem] = Field(
        description="List of missing details needed to complete or strengthen the case"
    )
    evidence_assessment: EvidenceAssessment = Field(
        description="Assessment of the evidence documents provided"
    )
    next_questions: List[str] = Field(
        description="List of clear, natural, and helpful follow-up questions to ask the user"
    )

class StoredIntakeResponse(BaseModel):
    analysis: IntakeAnalysis = Field(
        description="The validated intake analysis data"
    )
    version: int = Field(
        description="The version of this intake analysis output"
    )
    generated_at: datetime = Field(
        description="Timestamp when the analysis was generated or updated"
    )
