# Sprint Operational Plan: Cognera Resolve

## Sprint 1: Project Foundation & Environment Setup (Completed)
**Objective**: Build a clean, decoupled technical foundation, layout app shells, and initialize SQLite schemas before implementing business workflows.

### Completed Checklist
*   [x] **Frontend Environment setup**: React SPA initialized with Vite, Tailwind CSS v4, Zustand, Axios, Framer Motion, and React Router.
*   [x] **Routing & Layout Rules**:
    *   `/` redirects to `/dashboard`.
    *   `AppShell`, `Sidebar`, and `Topbar` shells designed with a modern dark theme.
    *   Unified `PageContainer`, `SectionCard`, `StatCard`, and custom SVG `ReadinessMeter` components.
    *   Page components created: `DashboardPage`, `NewCasePage`, `CaseWorkspacePage`, `DocumentsPage`, `HistoryPage`, `SettingsPage`.
    *   Workspace page uses an explicit 3-panel division (Left: Metadata, Center: Workspace Tabs, Right: Action Items & Gauge).
*   [x] **Frontend State Store**: `useCaseStore.js` Zustand store configured with Axios client endpoints and cached mock fallbacks.
*   [x] **Backend Service & API Framework**:
    *   FastAPI app boots with CORS configurations.
    *   `/api/health` returns operational JSON schema.
    *   Layered service framework introduced: route calls route to `app/services/case_service.py` to decouple SQLite interactions.
*   [x] **Database Tables Initialization**:
    *   SQLite database (`cognera_resolve.db`) successfully instantiated on startup.
    *   Import aggregation inside `app/models/__init__.py` ensures all tables (`users`, `complaint_cases`, `uploaded_documents`, `case_intake_responses`, `timeline_events`, `complaint_outputs`, `activity_logs`) are built.
*   [x] **Environment configurations**: Template `.env.example` and local `.env` variables saved.

---

## Sprint 1.1: Foundation Repair & Stabilization (Completed)
**Objective**: Stabilize and clean up folder structures, definitions, and router registries before starting development.

### Completed Checklist
*   [x] **Removed Wizard Terminology**: Consolidated `/cases/new` as a structured Case Creation page, and ensured code reviews and layout headings align with the Case Manager design.
*   [x] **Shared Case Type**: Created [`src/types/case.js`](file:///e:/Cap_project/Cognera%20resolve/frontend/src/types/case.js) defining the structural shape of a Case to prevent rendering issues.
*   [x] **Extracted Mock Cases**: Created [`src/mocks/cases.js`](file:///e:/Cap_project/Cognera%20resolve/frontend/src/mocks/cases.js) and removed inline mock arrays from `useCaseStore.js`.
*   [x] **Aggregated Backend Routes**: Created [`app/routes/__init__.py`](file:///e:/Cap_project/Cognera%20resolve/backend/app/routes/__init__.py) consolidating all routers under `api_router` and simplified route registrations in `app/main.py`.
*   [x] **Verified Field Name Alignments**: Guaranteed frontend and backend fields (such as `company_name`, `issue_category`, `current_step`, `readiness_score`, `summary`) are aligned exactly.

---

## Sprint 2: Core Workspace & Client-Server CRUD (Completed)
**Objective**: Establish complete client-server CRUD loops for case files, linking the React forms and workspace details directly to backend service handlers.

### Completed Checklist
*   [x] **Real Dashboard Flow**: Linked `DashboardPage.jsx` to fetch real database cases on load and calculate stats dynamically (Total Cases, Draft / Open, Average Readiness, and Recently Updated). Shows a proper empty state when no cases exist.
*   [x] **Working Case Form**: Connected `NewCasePage.jsx` form to submit fields (`title`, `company_name`, `issue_category`, `amount`, `purchase_date`, `summary`) to backend and redirect to workspace.
*   [x] **Workspace Metadata Binding**: Configured `/cases/:caseId` workspace page to load case facts from backend database by parameters.
*   [x] **Workspace Edit Modal**: Designed and integrated a modal overlay on `CaseWorkspacePage.jsx` to edit title, company, category, amount, and summary fields and patch the database.
*   [x] **Sorting Logic**: Modified backend `CaseService.get_cases` to sort cases by newest first (`created_at.desc()`).
*   [x] **Zustand CRUD States**: Upgraded `useCaseStore.js` to handle `loading`, `creating`, `updating`, and `error` states and bind `updateCase()` and `deleteCase()`.

---

## Sprint 2.1: Case CRUD Verification & Repair (Completed)
**Objective**: Verify and patch the case CRUD flow to make it completely stable and robust.

### Completed Checklist
*   [x] **Fixed New Case Submit Loading State**: Fixed `NewCasePage.jsx` button loader to look up `creating` instead of `loading` from the store, enabling the button to show "Initializing..." correctly on submit.
*   [x] **Prevented Stale Metadata Rendering**: Fixed `fetchCaseById` in `useCaseStore.js` to reset `activeCase` to `null` if the target case is not cached locally, preventing the UI from showing old case details while the new case loads from the server.
*   [x] **Case Deletion Entry Point**: Verified that Option A (Delete button in the top action area of `CaseWorkspacePage.jsx`) works correctly, prompting for confirmation and redirecting back to `/dashboard` on completion.

---

## Sprint 3: Evidence Upload Engine & Evidence Vault (Completed)
**Objective**: Allow physical document upload, validation, and storage.

### Completed Checklist
*   [x] **Document Routes Registration**: Registered `documents.router` inside backend centralized aggregate router. Created explicit endpoints:
    *   `POST /api/cases/{case_id}/documents` (single multipart file parameter)
    *   `GET /api/cases/{case_id}/documents` (lists case files metadata without internal paths)
    *   `DELETE /api/documents/{document_id}` (cleans up record and physical file on disk safely)
*   [x] **Local Storage Location**: Structured uploads under the case-specific local filesystem path `backend/uploads/cases/{case_id}/` using UUID-based filenames to prevent collisions.
*   [x] **MIME & Size Validations**: Implemented 10MB file size limit and allowed format filters (PDF, PNG, JPG/JPEG, WEBP) on both backend (`document_service.py`) and frontend (`EvidenceTab.jsx` pre-validation).
*   [x] **Evidence Vault UI Panel**: Extracted tab content into a standalone `<EvidenceTab caseId={caseId} />` component with drag-and-drop / select capabilities, uploading spinners, delete buttons, and empty/loading states.
*   [x] **Zustand Documents Store**: Created a dedicated `useDocumentStore.js` and `documentService.js` to handle file states without interfering with the case stores.
*   [x] **Lazy Data Fetching**: Integrated a data load trigger inside `EvidenceTab.jsx` component mount so files are only queried from the server when the user opens the Evidence Vault.

---

## Sprint 4: Structured AI Agent Workflows (Completed)
**Objective**: Integrate OpenAI API and orchestrate Intake & Audit Agent pipelines.

### Completed Checklist
*   [x] **Backend Structured Analysis Endpoints**:
    *   Exposed `POST /api/cases/{case_id}/intake/analyze` running structured AI completions, Pydantic validation, and database persistence.
    *   Exposed `GET /api/cases/{case_id}/intake` to retrieve latest stored analysis.
*   [x] **Zustand Intake State Store**: Created `useIntakeStore.js` and `intakeService.js` tracking loading, analyzing, errors, and protecting against case switches and API failures.
*   [x] **Intake Dashboard Integration**:
    *   Constructed `<OverviewIntakeTab />` inside the case workspace overview panel displaying version, categories, facts grid, assessment metrics, and next steps.
    *   Bound the Missing Info tab to display the dynamic checklist details including reasons and suggested prompts.

---

## Sprint 5: Resolution Drafting, Complaint Output Generation, and Final Demo Polish (Completed)
**Objective**: Build structured complaint drafting agent, expose API routes, persist output wrappers, and compile interactive resolution workspace.

### Completed Checklist
*   [x] **Backend Complaint Drafting Endpoints**:
    *   Exposed `POST /api/cases/{case_id}/outputs/complaint-draft` running structured AI completions (with graceful fallback to raw details if intake is absent) and DB persistence.
    *   Exposed `GET /api/cases/{case_id}/outputs/complaint-draft` fetching saved drafts.
*   [x] **Zustand Outputs State Store**: Created `useOutputStore.js` and `outputService.js` tracking generation states, protecting against stale flashes, and preserving previous drafts on failure.
*   [x] **Resolution Drafting Workspace Integration**:
    *   Constructed `<ComplaintDraftTab />` rendering versions, timestamps, tone/channel pills, key demand tags, disclaimers, and a clean read-only letter body.
    *   Mounted tab within the Resolution tab content panel of the case workspace.
    *   Unified fetch triggers in the workspace load hooks.


