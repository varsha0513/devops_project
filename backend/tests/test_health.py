def test_health_check(client):
    """Test health endpoint returns 200 and operational status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Smart Campus Issue API"
    assert "version" in data
