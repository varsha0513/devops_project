# Smart Campus Issues - FastAPI Backend

A modern, high-performance REST API built with FastAPI, SQLite, and SQLAlchemy to power the Smart Campus Issue Reporting & Management System.

---

## 1. Prerequisites

- Python 3.10+ (tested on Python 3.12)
- Windows PowerShell

---

## 2. Setup & Installation (Windows PowerShell)

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# (Optional) Copy environment configuration
cp .env.example .env
```

---

## 3. Database & Seeding

The application uses a persistent SQLite database located at `backend/smart_campus.db`.
Tables are created automatically when FastAPI starts.

### Seeding Development Records
To reset or populate the development database with realistic demo complaints:

```powershell
# In backend/ with active virtualenv:
python -m app.seed --reset
```

*(Note: In production environments, automatic re-seeding is disabled).*

---

## 4. Running the Backend Server

Start Uvicorn with auto-reload:

```powershell
# In backend/ directory:
.\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```

- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc Documentation: `http://127.0.0.1:8000/redoc`
- Health Check: `http://127.0.0.1:8000/health`

---

## 5. Running Automated Backend Tests

Tests run against an isolated temporary SQLite database so the primary development database is never modified.

```powershell
# In backend/ directory:
.\venv\Scripts\pytest.exe -v
```

---

## 6. REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | System health check (`status`, `service`, `version`) |
| `GET` | `/api/dashboard/stats` | Aggregated dashboard metrics, category & priority distribution, recent items |
| `GET` | `/api/issues` | List issues with query filters (`search`, `status`, `category`, `priority`, `sort_by`, `page`, `page_size`) |
| `GET` | `/api/issues/{id}` | Retrieve single issue by numeric DB ID or unique ticket ID (`SCI-YYYY-XXXX`) |
| `POST` | `/api/issues` | Create new issue (generates unique ticket ID and timestamp) |
| `PATCH` | `/api/issues/{id}` | Update issue status and/or details |
| `DELETE` | `/api/issues/{id}` | Delete issue record |
| `POST` | `/api/dev/reset-seed` | Development-only database reset and reseed (forbidden in production) |

---

## 7. Security & Authentication Limitations

> [!IMPORTANT]
> **Authentication Notice:**  
> This version provides full request validation, parameterized queries, and CORS origin restrictions. Authentication (JWT/OAuth2) and role-based access control (student vs. campus administrator) have not yet been implemented. Admin endpoints are currently open and **must not be deployed to public production environments without an authentication gateway or proxy**.
