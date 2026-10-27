"""Development-only seed utility for Smart Campus Issue Reporting System.

Requirements:
- Seeds sample data only when explicitly invoked or configured.
- Avoids inserting duplicate records on restarts.
- Safely resets development data when requested.
"""

import sys
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from .models import Issue

DEMO_ISSUES = [
    {
        "ticket_id": "SCI-2026-1048",
        "student_name": "Aarav Sharma",
        "title": "High-speed Wi-Fi router dropouts during lectures",
        "category": "Wi-Fi",
        "location": "Academic Block B - CS Lab 304",
        "priority": "High",
        "status": "In Progress",
        "hours_ago": 3,
        "description": "The primary access point in CS Lab 304 frequently disconnects every 10-15 minutes, interrupting hands-on network programming assignments for 60 students.",
    },
    {
        "ticket_id": "SCI-2026-1047",
        "student_name": "Priya Venkatesh",
        "title": "Ceiling fan making vibrating grinding sound",
        "category": "Electrical",
        "location": "Academic Block A - Lecture Hall 102",
        "priority": "Medium",
        "status": "Pending",
        "hours_ago": 8,
        "description": "The middle ceiling fan in row 4 vibrates violently at speeds 3 and 4, creating distracting noise and potential mechanical hazard.",
    },
    {
        "ticket_id": "SCI-2026-1046",
        "student_name": "Rohan Patel",
        "title": "Drinking water dispenser filtration warning light on",
        "category": "Water Supply",
        "location": "Central Library - 2nd Floor Reading Hall",
        "priority": "High",
        "status": "Pending",
        "hours_ago": 16,
        "description": "The UV filter replacement indicator has turned red and the water flow is extremely sluggish on the 2nd floor dispenser.",
    },
    {
        "ticket_id": "SCI-2026-1045",
        "student_name": "Ananya Deshmukh",
        "title": "Projector HDMI audio port damaged",
        "category": "Classroom Equipment",
        "location": "Academic Block B - Seminar Hall",
        "priority": "Medium",
        "status": "In Progress",
        "hours_ago": 28,
        "description": "The HDMI wall connector does not transmit sound to the auditorium speakers. Presenters currently have to use a portable speaker.",
    },
    {
        "ticket_id": "SCI-2026-1044",
        "student_name": "Vikramaditya Rao",
        "title": "Broken window latch on 2nd floor corridor",
        "category": "Maintenance",
        "location": "Academic Block A - Ground Floor",
        "priority": "Low",
        "status": "Resolved",
        "hours_ago": 48,
        "description": "The aluminum safety latch is missing on the stairwell window. Facility staff replaced the latch bracket.",
    },
    {
        "ticket_id": "SCI-2026-1043",
        "student_name": "Sneha Kulkarni",
        "title": "Cafeteria recycling bins overflowing after lunch hour",
        "category": "Cleanliness",
        "location": "Student Dining Hall / Cafeteria",
        "priority": "Medium",
        "status": "Resolved",
        "hours_ago": 72,
        "description": "Bins near exit doors fill up quickly between 12:30 PM and 2:00 PM. Requested additional high-capacity waste stations.",
    },
    {
        "ticket_id": "SCI-2026-1042",
        "student_name": "Karthik Menon",
        "title": "Outdoor solar pathway lamp malfunctioning",
        "category": "Other",
        "location": "Campus Parking & Outer Grounds",
        "priority": "Low",
        "status": "Pending",
        "hours_ago": 96,
        "description": "The solar walkway post between the boys hostel and sports field does not turn on after dusk, leaving the path dark.",
    },
]


def seed_demo_data(db: Session, force: bool = False) -> int:
    """
    Seed initial complaints data.
    If force=True, clears existing records first.
    If force=False, only seeds if the table is completely empty.
    Returns count of records seeded.
    """
    existing_count = db.query(Issue).count()

    if existing_count > 0 and not force:
        print(f"[Seed] Database already contains {existing_count} records. Skipping seed.")
        return 0

    if force and existing_count > 0:
        db.query(Issue).delete()
        db.commit()
        print(f"[Seed] Cleared {existing_count} existing records.")

    now = datetime.now(timezone.utc)
    created_records = []

    for item in DEMO_ISSUES:
        created_time = now - timedelta(hours=item["hours_ago"])
        issue = Issue(
            ticket_id=item["ticket_id"],
            student_name=item["student_name"],
            title=item["title"],
            category=item["category"],
            location=item["location"],
            priority=item["priority"],
            status=item["status"],
            description=item["description"],
            created_at=created_time,
            updated_at=created_time,
        )
        db.add(issue)
        created_records.append(issue)

    db.commit()
    print(f"[Seed] Successfully seeded {len(created_records)} sample complaints.")
    return len(created_records)


if __name__ == "__main__":
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        force_flag = "--reset" in sys.argv or "--force" in sys.argv
        count = seed_demo_data(db, force=force_flag)
        print(f"Done. {count} records populated.")
    finally:
        db.close()
