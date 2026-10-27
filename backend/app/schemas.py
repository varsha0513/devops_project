from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field, field_validator, ConfigDict, computed_field

VALID_CATEGORIES = [
    "Wi-Fi",
    "Electrical",
    "Water Supply",
    "Classroom Equipment",
    "Cleanliness",
    "Maintenance",
    "Other",
]

VALID_PRIORITIES = ["Low", "Medium", "High"]

VALID_STATUSES = ["Pending", "In Progress", "Resolved"]


class IssueBase(BaseModel):
    """Base schema for issue attributes."""
    student_name: str = Field(..., min_length=2, max_length=100, description="Student or staff reporter name", alias="studentName")
    title: str = Field(..., min_length=5, max_length=200, description="Summary title of the issue")
    description: str = Field(..., min_length=10, max_length=5000, description="Detailed problem description")
    category: str = Field(..., description="Campus facility category")
    location: str = Field(..., min_length=2, max_length=150, description="Campus building, room, or location")
    priority: str = Field(default="Medium", description="Urgency priority level (Low, Medium, High)")

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("student_name", "title", "description", "location")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Field cannot be empty or only whitespace")
            return cleaned
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        cleaned = v.strip() if isinstance(v, str) else v
        if cleaned not in VALID_CATEGORIES:
            raise ValueError(f"Invalid category '{cleaned}'. Must be one of: {', '.join(VALID_CATEGORIES)}")
        return cleaned

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        cleaned = v.strip() if isinstance(v, str) else v
        if cleaned not in VALID_PRIORITIES:
            raise ValueError(f"Invalid priority '{cleaned}'. Must be one of: {', '.join(VALID_PRIORITIES)}")
        return cleaned


class IssueCreate(IssueBase):
    """Payload to create a new complaint."""
    pass


class IssueUpdate(BaseModel):
    """Payload to update an existing complaint."""
    student_name: Optional[str] = Field(None, min_length=2, max_length=100, alias="studentName")
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=5000)
    category: Optional[str] = None
    location: Optional[str] = Field(None, min_length=2, max_length=150)
    priority: Optional[str] = None
    status: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("student_name", "title", "description", "location")
    @classmethod
    def strip_optional_whitespace(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Field cannot be empty or only whitespace")
            return cleaned
        return v

    @field_validator("category")
    @classmethod
    def validate_optional_category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = v.strip()
            if cleaned not in VALID_CATEGORIES:
                raise ValueError(f"Invalid category '{cleaned}'. Must be one of: {', '.join(VALID_CATEGORIES)}")
            return cleaned
        return v

    @field_validator("priority")
    @classmethod
    def validate_optional_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = v.strip()
            if cleaned not in VALID_PRIORITIES:
                raise ValueError(f"Invalid priority '{cleaned}'. Must be one of: {', '.join(VALID_PRIORITIES)}")
            return cleaned
        return v

    @field_validator("status")
    @classmethod
    def validate_optional_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = v.strip()
            if cleaned not in VALID_STATUSES:
                raise ValueError(f"Invalid status '{cleaned}'. Must be one of: {', '.join(VALID_STATUSES)}")
            return cleaned
        return v


class IssueResponse(BaseModel):
    """Detailed response schema for an issue."""
    id: int
    ticket_id: str
    student_name: str
    title: str
    description: str
    category: str
    location: str
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    @computed_field
    def studentName(self) -> str:
        return self.student_name

    @computed_field
    def ticketId(self) -> str:
        return self.ticket_id

    @computed_field
    def createdAt(self) -> str:
        return self.created_at.isoformat()

    @computed_field
    def updatedAt(self) -> str:
        return self.updated_at.isoformat()


class IssueListResponse(BaseModel):
    """Paginated list of issues."""
    items: List[IssueResponse]
    total: int
    page: int
    page_size: int
    pages: int


class DashboardStatsResponse(BaseModel):
    """Aggregated statistics for admin dashboard."""
    total: int
    pending: int
    in_progress: int
    resolved: int
    categories: Dict[str, int]
    priorities: Dict[str, int]
    recent: List[IssueResponse]

    model_config = ConfigDict(populate_by_name=True)

    @computed_field
    def inProgress(self) -> int:
        return self.in_progress
