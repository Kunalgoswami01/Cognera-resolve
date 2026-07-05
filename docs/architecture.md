# Technical Architecture: Cognera Resolve

This document describes the technical architecture, layout, and structures implemented for **Cognera Resolve**, a professional consumer dispute case management system.

## 1. Overall System Architecture
Cognera Resolve utilizes a Decoupled Client-Server architecture:
*   **Frontend (SPA)**: React, Vite, Tailwind CSS (v4), Zustand, React Router, and Axios.
*   **Backend (API)**: FastAPI ASGI, SQLAlchemy, and SQLite.
*   **AI Engine Integration (Planned)**: Structured Outputs via OpenAI Responses API.

```
+-------------------------------------------------------+
|                 Vite React Frontend                   |
|  - AppShell Layout                                    |
|  - React Router (Routing rules, Redirects)            |
|  - Zustand Stores (useCaseStore for state cache)      |
|  - Axios Client (apiClient pointing to backend)       |
|  - Types Definition (types/case.js shared shapes)    |
|  - Mock Data Library (mocks/cases.js)                |
+-------------------------------------------------------+
                           |
                     (HTTP / JSON)
                           v
+-------------------------------------------------------+
|                 FastAPI Backend API                   |
|  - CORS middleware                                     |
|  - Layered Service architecture (case_service.py)     |
|  - Aggregate route registration (app/routes/__init__.py)|
|  - Declarative SQLAlchemy base                        |
|  - SQLite Database engine                             |
+-------------------------------------------------------+
```

## 2. Directory Layout
```
/cognera-resolve/
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── components/        # Reusable visual shells
│   │   ├── services/          # HTTP clients (apiClient.js, caseService.js)
│   │   ├── store/             # Zustand stores (useCaseStore.js)
│   │   ├── types/             # Shared entities definition (case.js)
│   │   ├── mocks/             # External mock datasets (cases.js)
│   │   ├── pages/             # Page views (DashboardPage, CaseWorkspacePage, etc.)
│   │   ├── App.jsx            # Routing configurations
│   │   └── main.jsx           # Mount and providers
├── backend/                   # FastAPI Server
│   ├── app/
│   │   ├── core/              # Global configs
│   │   ├── db/                # Engine & session managers
│   │   ├── models/            # SQLAlchemy DB tables
│   │   ├── schemas/           # Pydantic payloads
│   │   ├── services/          # CRUD operations business logic
│   │   ├── routes/            # HTTP Routers (central api_router aggregate in __init__.py)
│   │   └── main.py            # App bootstrapper
└── docs/                      # Technical documentation
```

## 3. Database Schema Mapping
A relational SQLite database (`cognera_resolve.db`) stores the core entities:
*   `users`: Tracks basic consumer account references.
*   `complaint_cases`: Stores core dispute summaries, company names, categorizations, and progress states (`status`, `current_step`, `readiness_score`).
*   `uploaded_documents`: Metadata records of uploaded dispute documents.
*   `case_intake_responses`: Structured key-value answers to questions requested by the Audit Agent.
*   `timeline_events`: Chronological milestones of the dispute events.
*   `complaint_outputs`: Formatted markdown complaints and regulatory guidelines.
*   `activity_logs`: Auditable logs of case activities.

Model metadata is registered globally inside `app/models/__init__.py` to ensure safe database execution on startup.

## 4. Frontend Route Hierarchy
*   `/`: Redirects directly to `/dashboard`.
*   `/dashboard`: Renders `DashboardPage` containing active claim grids and stats.
*   `/cases/new`: Renders `NewCasePage` for inputting dispute claims. Treated as a structured case creation form rather than an intake wizard.
*   `/cases/:caseId`: Renders `CaseWorkspacePage` using a 3-panel layout:
    *   **Left Panel**: Metadata parameters, category, status, and timeline updates.
    *   **Center Panel**: Tabbed viewport (Overview, Evidence Vault, Missing Info, Chronology, and Resolution).
    *   **Right Panel**: Readiness circular gauge, checklist actions, and debug activity logs.
*   `/documents`: Central document vault page placeholder.
*   `/history`: Historical case outcome logs placeholder.
*   `/settings`: Configuration settings placeholder.
