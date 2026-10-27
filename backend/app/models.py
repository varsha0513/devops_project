from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Index
from .database import Base


def utc_now():
    """Return current UTC datetime."""
    return datetime.now(timezone.utc)


class Issue(Base):
    """SQLAlchemy model representing a campus complaint/issue."""

    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(String(32), unique=True, index=True, nullable=False)
    student_name = Column(String(100), nullable=False, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    location = Column(String(150), nullable=False, index=True)
    priority = Column(String(20), nullable=False, default="Medium", index=True)
    status = Column(String(20), nullable=False, default="Pending", index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    __table_args__ = (
        Index("ix_issues_status_created_at", "status", "created_at"),
        Index("ix_issues_category_priority", "category", "priority"),
    )

    def __repr__(self):
        return f"<Issue(id={self.id}, ticket_id='{self.ticket_id}', title='{self.title[:30]}...', status='{self.status}')>"
