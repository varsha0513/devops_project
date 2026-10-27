from datetime import datetime, timezone
import random
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, case

from ..database import get_db
from ..models import Issue
from ..schemas import IssueCreate, IssueUpdate, IssueResponse, IssueListResponse

router = APIRouter(prefix="/issues", tags=["Issues"])


def find_issue_by_identifier(db: Session, identifier: str) -> Optional[Issue]:
    """Find an issue by either its database integer ID or its string ticket ID."""
    if identifier.isdigit():
        issue = db.query(Issue).filter(Issue.id == int(identifier)).first()
        if issue:
            return issue
    return db.query(Issue).filter(Issue.ticket_id == identifier).first()


def generate_unique_ticket_id(db: Session) -> str:
    """Safely generate a collision-free ticket ID in SCI-YYYY-XXXX format."""
    year = datetime.now(timezone.utc).year
    for _ in range(50):
        rand_num = random.randint(1000, 9999)
        candidate = f"SCI-{year}-{rand_num}"
        exists = db.query(Issue.id).filter(Issue.ticket_id == candidate).first()
        if not exists:
            return candidate

    # Fallback to timestamp-based suffix if loop exhausted
    ts_suffix = str(int(datetime.now(timezone.utc).timestamp()))[-4:]
    return f"SCI-{year}-{ts_suffix}"


@router.get("", response_model=IssueListResponse)
def list_issues(
    search: Optional[str] = Query(None, description="Search by ID, title, student name, or location"),
    status: Optional[str] = Query(None, description="Filter by status (Pending, In Progress, Resolved)"),
    category: Optional[str] = Query(None, description="Filter by facility category"),
    priority: Optional[str] = Query(None, description="Filter by priority (Low, Medium, High)"),
    sort_by: str = Query("newest", pattern="^(newest|oldest|priority)$", description="Sort order"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=200, description="Items per page"),
    db: Session = Depends(get_db),
):
    """Retrieve issues with optional filtering, search, sorting, and pagination."""
    query = db.query(Issue)

    # Search filter
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Issue.ticket_id.ilike(term),
                Issue.title.ilike(term),
                Issue.student_name.ilike(term),
                Issue.location.ilike(term),
                Issue.description.ilike(term),
            )
        )

    # Status filter
    if status and status.strip() and status != "All":
        query = query.filter(Issue.status == status.strip())

    # Category filter
    if category and category.strip() and category != "All":
        query = query.filter(Issue.category == category.strip())

    # Priority filter
    if priority and priority.strip() and priority != "All":
        query = query.filter(Issue.priority == priority.strip())

    # Sorting
    if sort_by == "oldest":
        query = query.order_by(asc(Issue.created_at))
    elif sort_by == "priority":
        # High -> 3, Medium -> 2, Low -> 1
        priority_order = case(
            (Issue.priority == "High", 3),
            (Issue.priority == "Medium", 2),
            (Issue.priority == "Low", 1),
            else_=0,
        )
        query = query.order_by(desc(priority_order), desc(Issue.created_at))
    else:  # newest (default)
        query = query.order_by(desc(Issue.created_at))

    total = query.count()
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    pages = (total + page_size - 1) // page_size if total > 0 else 1

    return IssueListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{identifier}", response_model=IssueResponse)
def get_issue(identifier: str, db: Session = Depends(get_db)):
    """Retrieve a single complaint by database ID or ticket ID."""
    issue = find_issue_by_identifier(db, identifier)
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID or Ticket '{identifier}' not found",
        )
    return issue


@router.post("", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
def create_issue(payload: IssueCreate, db: Session = Depends(get_db)):
    """Create a new complaint with automatic ticket ID generation."""
    ticket_id = generate_unique_ticket_id(db)

    issue = Issue(
        ticket_id=ticket_id,
        student_name=payload.student_name,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        location=payload.location,
        priority=payload.priority,
        status="Pending",
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue


@router.patch("/{identifier}", response_model=IssueResponse)
def update_issue(identifier: str, payload: IssueUpdate, db: Session = Depends(get_db)):
    """Update fields and/or status of an existing complaint."""
    issue = find_issue_by_identifier(db, identifier)
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID or Ticket '{identifier}' not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return issue

    for key, value in update_data.items():
        if hasattr(issue, key) and value is not None:
            setattr(issue, key, value)

    issue.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(issue)
    return issue


@router.delete("/{identifier}", status_code=status.HTTP_200_OK)
def delete_issue(identifier: str, db: Session = Depends(get_db)):
    """Permanently delete an issue record."""
    issue = find_issue_by_identifier(db, identifier)
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID or Ticket '{identifier}' not found",
        )

    deleted_id = issue.id
    deleted_ticket = issue.ticket_id

    db.delete(issue)
    db.commit()

    return {
        "message": "Complaint deleted successfully",
        "id": deleted_id,
        "ticket_id": deleted_ticket,
    }
