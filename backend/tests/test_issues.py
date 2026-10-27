from app.models import Issue


def test_create_issue_success(client):
    """Test successful issue creation with valid fields."""
    payload = {
        "student_name": "Divya Krishnan",
        "title": "Air conditioning failure in seminar hall",
        "description": "The central AC system stopped cooling during morning lectures and makes a loud hum.",
        "category": "Electrical",
        "location": "Academic Block B - Seminar Hall",
        "priority": "High",
    }
    response = client.post("/api/issues", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["student_name"] == "Divya Krishnan"
    assert data["title"] == payload["title"]
    assert data["category"] == "Electrical"
    assert data["priority"] == "High"
    assert data["status"] == "Pending"
    assert data["ticket_id"].startswith("SCI-")
    assert isinstance(data["id"], int)
    assert "created_at" in data
    assert "updated_at" in data


def test_create_issue_validation_failures(client):
    """Test field validations: missing required fields and short strings."""
    # Missing title and description
    response = client.post("/api/issues", json={"student_name": "Test"})
    assert response.status_code == 422
    assert "Validation error" in response.json()["detail"]

    # Title too short (< 5 chars)
    payload = {
        "student_name": "John Doe",
        "title": "Bad",
        "description": "Valid long enough description here.",
        "category": "Wi-Fi",
        "location": "Library Floor 1",
        "priority": "Low",
    }
    res_short_title = client.post("/api/issues", json=payload)
    assert res_short_title.status_code == 422

    # Description too short (< 10 chars)
    payload["title"] = "Valid Title"
    payload["description"] = "Short"
    res_short_desc = client.post("/api/issues", json=payload)
    assert res_short_desc.status_code == 422


def test_invalid_category_and_priority(client):
    """Test rejection of unsupported category and priority values."""
    payload = {
        "student_name": "Kavita Sen",
        "title": "Broken elevator button",
        "description": "Button 4 is unpressable and jammed in socket.",
        "category": "Nuclear Physics Lab",  # Invalid category
        "location": "Tech Tower",
        "priority": "Urgent",  # Invalid priority (must be Low, Medium, High)
    }
    response = client.post("/api/issues", json=payload)
    assert response.status_code == 422


def test_list_and_filter_issues(client):
    """Test listing complaints, searching, and filtering by category/status/priority."""
    # Create two issues
    i1 = client.post(
        "/api/issues",
        json={
            "student_name": "Sameer Khan",
            "title": "Wi-Fi connection latency in hostel",
            "description": "Ping spikes up to 800ms between 8 PM and 11 PM regularly.",
            "category": "Wi-Fi",
            "location": "Boys Hostel - Block 1",
            "priority": "Medium",
        },
    ).json()

    i2 = client.post(
        "/api/issues",
        json={
            "student_name": "Meera Nair",
            "title": "Water leakage under lab sink",
            "description": "Continuous dripping from pipe elbow under Chemistry Lab station 4.",
            "category": "Water Supply",
            "location": "Science Complex - Chemistry Lab",
            "priority": "High",
        },
    ).json()

    # List all
    res_all = client.get("/api/issues")
    assert res_all.status_code == 200
    all_data = res_all.json()
    assert all_data["total"] >= 2
    assert len(all_data["items"]) >= 2

    # Search filter
    res_search = client.get("/api/issues?search=hostel")
    assert res_search.status_code == 200
    search_items = res_search.json()["items"]
    assert any(item["id"] == i1["id"] for item in search_items)
    assert not any(item["id"] == i2["id"] for item in search_items)

    # Category filter
    res_cat = client.get("/api/issues?category=Water%20Supply")
    assert res_cat.status_code == 200
    cat_items = res_cat.json()["items"]
    assert all(item["category"] == "Water Supply" for item in cat_items)

    # Priority filter
    res_pri = client.get("/api/issues?priority=High")
    assert res_pri.status_code == 200
    pri_items = res_pri.json()["items"]
    assert all(item["priority"] == "High" for item in pri_items)

    # Sorting
    res_sort = client.get("/api/issues?sort_by=oldest")
    assert res_sort.status_code == 200


def test_get_issue_by_id_and_ticket(client):
    """Test retrieving issue by numeric ID and ticket string."""
    created = client.post(
        "/api/issues",
        json={
            "student_name": "Tanvi Gupta",
            "title": "Library lights flickering near cubicles",
            "description": "Three fluorescent tubes in row 7 constantly flicker and cause eye strain.",
            "category": "Electrical",
            "location": "Central Library - 2nd Floor Reading Hall",
            "priority": "Low",
        },
    ).json()

    numeric_id = created["id"]
    ticket_id = created["ticket_id"]

    # By numeric ID
    res1 = client.get(f"/api/issues/{numeric_id}")
    assert res1.status_code == 200
    assert res1.json()["id"] == numeric_id

    # By ticket string
    res2 = client.get(f"/api/issues/{ticket_id}")
    assert res2.status_code == 200
    assert res2.json()["ticket_id"] == ticket_id


def test_get_missing_issue_returns_404(client):
    """Test 404 response when querying a non-existent issue."""
    response = client.get("/api/issues/999999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

    res_ticket = client.get("/api/issues/SCI-1990-0000")
    assert res_ticket.status_code == 404


def test_update_issue_and_status(client):
    """Test updating status and details via PATCH."""
    created = client.post(
        "/api/issues",
        json={
            "student_name": "Arjun Das",
            "title": "Damaged classroom podium microphone",
            "description": "The gooseneck microphone cable is frayed and outputs heavy static.",
            "category": "Classroom Equipment",
            "location": "Academic Block A - Lecture Hall 102",
            "priority": "Medium",
        },
    ).json()

    issue_id = created["id"]

    # Transition status to In Progress
    res_patch = client.patch(
        f"/api/issues/{issue_id}",
        json={"status": "In Progress"},
    )
    assert res_patch.status_code == 200
    assert res_patch.json()["status"] == "In Progress"

    # Transition status to Resolved with priority update
    res_resolved = client.patch(
        f"/api/issues/{issue_id}",
        json={"status": "Resolved", "priority": "Low"},
    )
    assert res_resolved.status_code == 200
    assert res_resolved.json()["status"] == "Resolved"
    assert res_resolved.json()["priority"] == "Low"

    # Invalid status rejection
    res_invalid_status = client.patch(
        f"/api/issues/{issue_id}",
        json={"status": "Finished"},
    )
    assert res_invalid_status.status_code == 422


def test_delete_issue(client):
    """Test deleting an issue removes it permanently."""
    created = client.post(
        "/api/issues",
        json={
            "student_name": "Temporary User",
            "title": "Issue to be deleted immediately",
            "description": "Testing removal of temporary complaint from database.",
            "category": "Other",
            "location": "Campus Parking & Outer Grounds",
            "priority": "Low",
        },
    ).json()

    issue_id = created["id"]

    # Delete
    res_del = client.delete(f"/api/issues/{issue_id}")
    assert res_del.status_code == 200
    assert res_del.json()["id"] == issue_id

    # Verify 404 on subsequent get
    res_get = client.get(f"/api/issues/{issue_id}")
    assert res_get.status_code == 404


def test_database_persistence(client, db_session):
    """Test that issue created through API is persistently saved in SQLAlchemy models."""
    res = client.post(
        "/api/issues",
        json={
            "student_name": "Persistence Tester",
            "title": "Persistent database check complaint",
            "description": "Verifying that the record exists directly in the underlying database table.",
            "category": "Maintenance",
            "location": "Administrative Block - Registrar Office",
            "priority": "Medium",
        },
    )
    assert res.status_code == 201
    created_id = res.json()["id"]

    # Direct query against the db session
    record = db_session.query(Issue).filter(Issue.id == created_id).first()
    assert record is not None
    assert record.student_name == "Persistence Tester"
    assert record.title == "Persistent database check complaint"
    assert record.created_at is not None
