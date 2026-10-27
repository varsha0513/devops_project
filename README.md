# Smart Campus Issue Reporting & Management System

A full-stack, enterprise-grade campus facility incident management platform featuring a **FastAPI + SQLite** backend and a responsive **React + Vite** frontend.

---

## Architecture Overview

```
smart_campus_issues/
├── frontend/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components & SVG icons
│   │   ├── pages/                # Dashboard, Report Issue, Manage Issues views
│   │   ├── utils/                # API client (api.js), storage & formatters
│   │   └── constants/            # Categories, Priorities, Campus Locations
│   ├── .env.example              # Frontend environment variables template
│   ├── .env                      # Local frontend environment config
│   ├── index.html                # HTML entry point with Plus Jakarta Sans fonts
│   └── package.json
├── backend/                      # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py               # FastAPI application entry & CORS config
│   │   ├── database.py           # SQLAlchemy SQLite engine & session management
│   │   ├── models.py             # Issue ORM model with database indexes
│   │   ├── schemas.py            # Pydantic request/response validation schemas
│   │   ├── seed.py               # Safe development seed & reset utility
│   │   └── routes/
│   │       ├── issues.py         # Full CRUD endpoints for complaints
│   │       └── dashboard.py      # Aggregated metrics & distribution stats
│   ├── tests/                    # Automated pytest test suite
│   ├── venv/                     # Python virtual environment
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example              # Backend environment variables template
│   ├── .env                      # Local backend environment config
│   └── README.md
├── .gitignore
└── README.md
```

---

## 1. Quickstart Guide (Windows PowerShell)

Run the backend and frontend in separate PowerShell terminal windows.

### Terminal 1: Backend (FastAPI + Uvicorn)

```powershell
# 1. Navigate to the backend folder
cd d:\smart_campus_issues\backend

# 2. Create the Python virtual environment (if not already created)
python -m venv venv

# 3. Activate the virtual environment
.\venv\Scripts\Activate.ps1

# 4. Install dependencies
pip install -r requirements.txt

# 5. Populate initial development records (safe idempotent seed)
python -m app.seed --reset

# 6. Start the FastAPI server with Uvicorn
.\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **API Base URL:** `http://127.0.0.1:8000`
- **Interactive Swagger Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc API Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Endpoint:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### Terminal 2: Frontend (React + Vite)

```powershell
# 1. Navigate to the frontend folder
cd d:\smart_campus_issues\frontend

# 2. Verify dependencies are installed
npm install

# 3. Start the Vite development server
npm run dev
```

- **Frontend Portal URL:** [http://localhost:5173](http://localhost:5173)

---

## 2. Running Automated Tests & Builds

### Backend Automated Tests (Pytest)

The test suite runs against an isolated, temporary SQLite database (`test_smart_campus.db`), leaving your development database completely untouched.

```powershell
cd d:\smart_campus_issues\backend
.\venv\Scripts\pytest.exe -v
```

**11 passing tests cover:**
- `GET /health` service availability
- Complaint creation and validation logic
- Rejection of unsupported categories and priorities
- Query searching, sorting, and multi-facet filtering
- Fetching by numeric ID vs. unique ticket string (`SCI-YYYY-XXXX`)
- Handling missing records (404 Not Found)
- Status and attribute updates (`PATCH`)
- Complaint deletion (`DELETE`)
- Database model persistence
- Aggregated dashboard metrics

### Frontend Lint & Production Build

```powershell
cd d:\smart_campus_issues\frontend

# Run ESLint (0 errors, 0 warnings)
npm run lint

# Build production bundle
npm run build
```

---

## 3. Database Location & Seeding Mechanism

- **Database File:** `backend/smart_campus.db` (SQLite)
- **Automatic Initialization:** Database tables and indexes are generated on startup automatically via SQLAlchemy (`Base.metadata.create_all`).
- **Data Persistence:** Existing records are preserved across server restarts.
- **Development Seed Procedure:**
  - Execute `python -m app.seed` to seed only when the database is empty.
  - Execute `python -m app.seed --reset` to wipe and reseed the sample dataset.
  - Or use the **"Dev: Reseed SQLite"** button in the sidebar (visible in development mode only).
  - In production (`ENVIRONMENT=production`), automatic seeding and the dev reseed endpoint are disabled.

---

## 4. REST API Endpoints

| Method | Endpoint | Query / Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | None | Service operational status & version |
| `GET` | `/api/dashboard/stats` | None | Aggregated total, pending, in-progress, resolved, category & priority distribution |
| `GET` | `/api/issues` | `search`, `status`, `category`, `priority`, `sort_by`, `page`, `page_size` | List complaints with server-side filters & pagination |
| `GET` | `/api/issues/{id}` | Path param (int or ticket ID string) | Retrieve a single complaint |
| `POST` | `/api/issues` | JSON body (`student_name`, `title`, `description`, `category`, `location`, `priority`) | Create a new complaint; returns generated `SCI-YYYY-XXXX` ticket ID |
| `PATCH` | `/api/issues/{id}` | JSON body (`status`, `priority`, `title`, etc.) | Update complaint status or details |
| `DELETE` | `/api/issues/{id}` | Path param (int or ticket ID string) | Permanently remove complaint record |
| `POST` | `/api/dev/reset-seed` | None | Reseeds development records (disabled in production) |

---

## 5. Security & Authentication Limitations

> [!WARNING]
> **Authentication Limitations:**  
> This version includes strict Pydantic input validation, SQL injection prevention via SQLAlchemy parameterized queries, and CORS origin restrictions.  
> However, **authentication (JWT/OAuth2) and role-based access control (RBAC) are not yet implemented**.  
> The administrative controls and endpoints are currently open to anyone on the network. **Do not deploy this application to a public, production-accessible network without an authentication gateway, VPN, or reverse-proxy authentication layer.**
