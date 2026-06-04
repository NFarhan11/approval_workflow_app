# Leave Request Approval Workflow

A full-stack web app implementing a multi-level leave request approval system with role-based access control and a sequential approval state machine.

**Live demo:** https://frontend-production-f1cc.up.railway.app

## Test Accounts

| Role | Email | Password | Name |
|---|---|---| --- |
| Admin | admin@example.com | password | Admin User |
| Approver (L1) | approver1@example.com | password | Alice Approver |
| Approver (L2) | approver2@example.com | password | Bob Approver |
| Requester | requester1@example.com | password | Charlie Requester |
---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), TailwindCSS, shadcn/ui |
| State management | Zustand (auth), TanStack Query (server state) |
| Backend | Laravel 12, Laravel Sanctum (API token auth) |
| Database | PostgreSQL |
| HTTP client | Axios with request/response interceptors |
| Deployment | Railway (backend + DB + frontend, all in one platform) |

---

## Architecture

### Auth
Sanctum is used in **API token mode** — not the default SPA cookie mode — because the frontend and backend are on separate domains. On login, the backend issues a token. The frontend stores it in Zustand and an Axios interceptor attaches it as `Authorization: Bearer <token>` on every request. A response interceptor handles 401s globally by clearing state and redirecting to login.

### Approval State Machine
Each leave request moves through a sequential chain of approvers:

```
pending → [Level 1 approves] → in_progress → [Level 2 approves] → approved
        → [Any level rejects]                                     → rejected
```

`leave_requests.current_step` tracks which level is active. All `approval_steps` rows are pre-created when the request is submitted. On each approval action, `ApprovalController` verifies the authenticated user owns that step, then advances or finalises the state.

### Role-Based Access
Three roles: `requester`, `approver`, `admin`. Enforced at two layers:

- **Backend** — `LeaveRequestPolicy` + controller-level role checks. The `index()` methods filter data server-side so requesters only see their own requests, approvers only see assigned ones.
- **Frontend** — React Router protected routes + conditional rendering (e.g. approve/reject buttons only render for the active approver of the current step).

---

## Key Features

- **Multi-step approval chains** — requests can have 1 or more sequential approvers, each with an independent comment
- **Role-gated views** — dashboard stats, request lists, and action buttons adapt per role automatically
- **Admin panel** — assign roles and manage users
- **Idempotent seeding** — `firstOrCreate` in seeders so container restarts don't duplicate data
- **Dockerised backend** — PHP 8.4 Alpine image, runs migrations and seeds on startup

---

## Database Schema

```
users
  id, name, email, password, role (requester|approver|admin), department

leave_requests
  id, requester_id → users, leave_type, start_date, end_date,
  reason, status (pending|in_progress|approved|rejected),
  current_step, total_steps

approval_steps
  id, leave_request_id → leave_requests, approver_id → users,
  step_number, status (pending|approved|rejected), comment, actioned_at
```

---

## API Routes

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/leave-requests           # role-scoped automatically
POST   /api/leave-requests           # requester only
GET    /api/leave-requests/{id}
DELETE /api/leave-requests/{id}      # own + pending only

POST   /api/leave-requests/{id}/approve    # body: { comment }
POST   /api/leave-requests/{id}/reject     # body: { comment }

GET    /api/admin/users
PATCH  /api/admin/users/{id}/role          # body: { role }
GET    /api/admin/approvers

GET    /api/dashboard/stats
```

All routes are protected by `sanctum:auth` middleware.

---

## Project Structure

```
approval_workflow_app/
├── backend/                  # Laravel 12
│   ├── app/
│   │   ├── Models/           # User, LeaveRequest, ApprovalStep
│   │   ├── Policies/         # LeaveRequestPolicy
│   │   └── Http/Controllers/Api/
│   │       ├── AuthController.php
│   │       ├── LeaveRequestController.php
│   │       ├── ApprovalController.php
│   │       ├── AdminController.php
│   │       └── DashboardController.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── Dockerfile
└── frontend/                 # React + Vite
    └── src/
        ├── components/
        │   ├── ui/           # shadcn/ui components
        │   ├── layout/       # AppShell, Sidebar
        │   └── shared/       # StatusBadge, ApprovalTimeline
        ├── pages/            # auth, dashboard, requests, admin
        ├── services/api.js   # Axios instance + interceptors
        ├── store/authStore.js
        └── router/
```
