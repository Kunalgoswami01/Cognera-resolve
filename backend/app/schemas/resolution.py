from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class ComplaintDraft(BaseModel):
    subject_line: str = Field(
        description="A concise and professional subject line for the complaint/escalation email or letter"
    )
    draft_markdown: str = Field(
        description="The main body of the complaint letter, formatted in clean Markdown. Start directly with a formal salutation and organize the letter logically with paragraphs."
    )
    tone: Literal["professional_firm", "polite_formal", "escalated_strong"] = Field(
        description="The tone of the draft letter"
    )
    target_channel: Literal["email", "support_portal", "consumer_forum"] = Field(
        description="The recommended channel for sending this complaint"
    )
    key_demands: List[Literal["refund", "replacement", "repair", "cancellation", "explanation", "compensation"]] = Field(
        description="List of requested actions/demands from the merchant"
    )
    missing_disclaimer: Optional[str] = Field(
        default=None, 
        description="A note describing any key assumptions made due to missing case information"
    )

class StoredDraftResponse(BaseModel):
    draft: ComplaintDraft = Field(
        description="The generated complaint draft details"
    )
    version: int = Field(
        description="Version of this generated draft"
    )
    generated_at: datetime = Field(
        description="Timestamp when the draft was generated or updated"
    )
