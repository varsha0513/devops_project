from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from ..database import get_db
from ..models import Issue
from ..schemas import DashboardStatsResponse, VALID_CATEGORIES, VALID_PRIORITIES

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Retrieve summarized statistics and latest issues for the administration dashboard."""
    # Status counts
    status_counts_raw = (
        db.query(Issue.status, func.count(Issue.id))
        .group_by(Issue.status)
        .all()
    )
    status_dict = {status: count for status, count in status_counts_raw}

    total = db.query(Issue).count()
    pending = status_dict.get("Pending", 0)
    in_progress = status_dict.get("In Progress", 0)
    resolved = status_dict.get("Resolved", 0)

    # Category breakdown
    category_counts_raw = (
        db.query(Issue.category, func.count(Issue.id))
        .group_by(Issue.category)
        .all()
    )
    category_dict = {cat: 0 for cat in VALID_CATEGORIES}
    for cat, count in category_counts_raw:
        category_dict[cat] = count

    # Priority breakdown (unresolved priority distribution)
    priority_counts_raw = (
        db.query(Issue.priority, func.count(Issue.id))
        .group_by(Issue.priority)
        .all()
    )
    priority_dict = {p: 0 for p in VALID_PRIORITIES}
    for p, count in priority_counts_raw:
        priority_dict[p] = count

    # Recent 6 complaints
    recent_issues = (
        db.query(Issue)
        .order_by(desc(Issue.created_at))
        .limit(6)
        .all()
    )

    return DashboardStatsResponse(
        total=total,
        pending=pending,
        in_progress=in_progress,
        resolved=resolved,
        categories=category_dict,
        priorities=priority_dict,
        recent=recent_issues,
    )
