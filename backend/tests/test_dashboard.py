def test_dashboard_stats(client):
    """Test dashboard stats endpoint returns accurate counts and breakdowns."""
    # Seed 3 complaints with different statuses and categories
    client.post(
        "/api/issues",
        json={
            "student_name": "Student A",
            "title": "Wi-Fi drop in cafeteria area",
            "description": "Signal drops near south entrance seating area.",
            "category": "Wi-Fi",
            "location": "Student Dining Hall / Cafeteria",
            "priority": "High",
        },
    )
    i2 = client.post(
        "/api/issues",
        json={
            "student_name": "Student B",
            "title": "Water fountain leaking constantly",
            "description": "Continuous small stream leaking onto floor tiles.",
            "category": "Water Supply",
            "location": "Central Library - 2nd Floor Reading Hall",
            "priority": "Medium",
        },
    ).json()

    # Mark i2 as In Progress
    client.patch(f"/api/issues/{i2['id']}", json={"status": "In Progress"})

    i3 = client.post(
        "/api/issues",
        json={
            "student_name": "Student C",
            "title": "Cleanliness issue in auditorium restroom",
            "description": "Restroom requires cleaning before afternoon guest lecture.",
            "category": "Cleanliness",
            "location": "Academic Block B - Seminar Hall",
            "priority": "Low",
        },
    ).json()

    # Mark i3 as Resolved
    client.patch(f"/api/issues/{i3['id']}", json={"status": "Resolved"})

    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    stats = response.json()

    assert stats["total"] >= 3
    assert stats["pending"] >= 1
    assert stats["in_progress"] >= 1
    assert stats["resolved"] >= 1

    # Check categories map
    assert "Wi-Fi" in stats["categories"]
    assert stats["categories"]["Wi-Fi"] >= 1
    assert "Water Supply" in stats["categories"]
    assert stats["categories"]["Water Supply"] >= 1

    # Check priorities map
    assert "High" in stats["priorities"]
    assert "Medium" in stats["priorities"]
    assert "Low" in stats["priorities"]

    # Check recent items
    assert "recent" in stats
    assert len(stats["recent"]) > 0
