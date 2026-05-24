# Approval Workflow App — Leave Request MVP (Week 1)

## Context

Building a portfolio-quality web app for job seeking. The app is a Leave / Time-off Request Approval Workflow with multi-level sequential approval chains. It demonstrates real-world patterns: role-based access control, multi-step state machines, SPA + API architecture. Designed to be extensible into a generic workflow engine in the future.

**Timeline**: 7 days to working, deployed MVP  
**Deploy targets**: Vercel (React) + Railway (Laravel + PostgreSQL)  
**Auth**: Email + Password via Laravel Sanctum (token mode, cross-origin)  
**Notifications**: Out of scope for week 1  

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite) + TailwindCSS + shadcn/ui |
| State / Data | Zustand (auth), TanStack Query (server data) |
| Backend | Laravel 11 + Sanctum (API tokens) |
| Database | PostgreSQL |
| HTTP Client | Axios |
| Deploy | Vercel (frontend) + Railway (backend + DB) |

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| name | string | |
| email | string unique | |
| password | hashed string | |
| role | enum | `requester`, `approver`, `admin` |
| department | string nullable | for display/grouping |
| timestamps | | |

### `leave_requests`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| requester_id | FK → users | |
| leave_type | enum | `annual`, `sick`, `emergency`, `unpaid` |
| start_date | date | |
| end_date | date | |
| reason | text | |
| status | enum | `pending`, `in_progress`, `approved`, `rejected` |
| current_step | int | which approval level is active (1-based) |
| total_steps | int | total levels in the chain |
| timestamps | | |

### `approval_steps`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| leave_request_id | FK → leave_requests | |
| approver_id | FK → users | |
| step_number | int | 1 = first, 2 = second, etc. |
| status | enum | `pending`, `approved`, `rejected` |
| comment | text nullable | |
| actioned_at | timestamp nullable | |
| timestamps | | |

**State machine for `leave_requests.status`:**
```
pending → [Level 1 approves] → in_progress → [Level 2 approves] → approved
         → [Any level rejects] → rejected
```

---

## Laravel Backend Structure

```
app/
  Models/
    User.php           — role enum, hasMany leaveRequests, hasMany approvalSteps
    LeaveRequest.php   — belongsTo user, hasMany approvalSteps, scopeForUser()
    ApprovalStep.php   — belongsTo leaveRequest, belongsTo approver
  Policies/
    LeaveRequestPolicy.php  — view: own or assigned approver or admin; update: assigned approver
  Http/Controllers/Api/
    AuthController.php       — login, register, logout, me
    LeaveRequestController.php — index, store, show, destroy
    ApprovalController.php   — approve, reject (advances or finalizes workflow)
    AdminController.php      — user list, role assignment, approver assignment
    DashboardController.php  — stats (counts by status, by role)
  Http/Resources/
    LeaveRequestResource.php — includes nested ApprovalStepResource
    UserResource.php
routes/
  api.php             — all routes behind sanctum:auth middleware
database/
  migrations/         — users (add role/department cols), leave_requests, approval_steps
  seeders/
    DatabaseSeeder.php — seed 1 admin, 2 approvers, 3 requesters, sample requests
```

### Key API Routes

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/leave-requests          # filtered by role automatically
POST   /api/leave-requests          # requester only
GET    /api/leave-requests/{id}
DELETE /api/leave-requests/{id}     # own + pending only

POST   /api/leave-requests/{id}/approve   # body: { comment }
POST   /api/leave-requests/{id}/reject    # body: { comment }

GET    /api/admin/users
PATCH  /api/admin/users/{id}/role         # body: { role }
GET    /api/admin/approvers               # list available approvers for chain config

GET    /api/dashboard/stats
```

### Approval Chain Logic (in `ApprovalController@approve`)
1. Find the current active `ApprovalStep` for this request (step_number == current_step, status == pending)
2. Verify authenticated user IS the assigned approver for this step
3. Mark step as `approved`, set `actioned_at`
4. If `current_step < total_steps`: increment `current_step`, set request status = `in_progress`
5. If `current_step == total_steps`: set request status = `approved`
6. On reject: mark step `rejected`, set request status = `rejected` (short-circuit all remaining steps)

---

## React Frontend Structure

```
src/
  components/
    ui/              — shadcn components (Button, Card, Badge, Dialog, etc.)
    layout/
      AppShell.jsx   — sidebar + topbar wrapper
      Sidebar.jsx    — role-aware nav links
    shared/
      StatusBadge.jsx       — color-coded leave_request status
      ApprovalTimeline.jsx  — visual step-by-step approval chain
  pages/
    auth/
      LoginPage.jsx
      RegisterPage.jsx
    dashboard/
      DashboardPage.jsx     — role-based stats cards
    requests/
      RequestListPage.jsx   — table with filters (status, date)
      RequestCreatePage.jsx — form: leave type, dates, reason
      RequestDetailPage.jsx — full detail + approval timeline + action buttons
    admin/
      UserManagementPage.jsx  — table of users, role toggle
  hooks/
    useAuth.js          — wraps Zustand auth store
    useLeaveRequests.js — TanStack Query hooks for all request endpoints
  services/
    api.js              — Axios instance with baseURL + Bearer token interceptor
  store/
    authStore.js        — Zustand: user object, token, login/logout actions
  router/
    index.jsx           — React Router v6, protected routes by role
```

### Role-based UI Rules
| Role | Can See |
|---|---|
| Requester | Own requests only, create new request |
| Approver | Requests assigned to them (pending their action), history of actioned |
| Admin | All requests, user management, full dashboard stats |

---

## Day-by-Day Build Schedule

### Day 1 — Project Setup + Auth
- **Backend**: `laravel new backend`, install Sanctum, configure PostgreSQL, modify `users` migration (add role, department), `AuthController` (register/login/logout/me), test with Postman
- **Frontend**: `npm create vite@latest frontend -- --template react`, install TailwindCSS, install shadcn/ui, install Axios + Zustand + TanStack Query + React Router v6
- **Deliverable**: Working login/register flow in browser, token stored in Zustand

### Day 2 — Database + Seeders
- Create migrations: `leave_requests`, `approval_steps`
- Create Models with relationships and accessors
- Write DatabaseSeeder with realistic test data (multiple requesters, 2 approvers, sample requests in each status)
- **Deliverable**: `php artisan migrate:fresh --seed` works, data visible in DB

### Day 3 — Leave Request CRUD
- **Backend**: `LeaveRequestController` (index with role scoping, store, show), `LeaveRequestResource`, `LeaveRequestPolicy`
- **Frontend**: `RequestListPage` (table with status badges), `RequestCreatePage` (form with date picker, leave type select)
- **Deliverable**: Requester can create and view their own requests

### Day 4 — Approval Workflow
- **Backend**: `ApprovalController` (approve, reject), full state machine logic
- **Frontend**: `RequestDetailPage` with `ApprovalTimeline` component, approve/reject buttons (only shown to the active approver), comment textarea in Dialog
- **Deliverable**: Full multi-step approval chain working end-to-end

### Day 5 — Admin Panel + Dashboard
- **Backend**: `AdminController`, `DashboardController`
- **Frontend**: `DashboardPage` (stat cards per role), `UserManagementPage` (assign roles, view all users)
- **Deliverable**: Admin can manage users and see global stats

### Day 6 — Deploy
- **Railway**: New project → Laravel service (Dockerfile or Nixpacks) + PostgreSQL plugin, set `APP_KEY`, `DB_*`, `SANCTUM_STATEFUL_DOMAINS` env vars, run migrations via Railway CLI
- **Vercel**: Connect frontend repo, set `VITE_API_URL` env var to Railway URL
- Update Laravel `cors.php` to allow Vercel domain
- **Deliverable**: Live URL shared

### Day 7 — Buffer
- Bug fixes from real deployment
- Polish UI (loading states, empty states, error handling)
- Write README with screenshots for portfolio

---

## Key Libraries to Install

**Laravel (composer)**
```
laravel/sanctum
```

**React (npm)**
```
@tanstack/react-query
zustand
axios
react-router-dom
react-hook-form
@hookform/resolvers
zod
date-fns
lucide-react
```
**shadcn/ui components needed**: Button, Card, Badge, Table, Dialog, Form, Input, Select, Textarea, Separator, Avatar, DropdownMenu, Tabs

---

## Deployment Config Notes

- **Sanctum mode**: Use **API token** (not SPA cookie), because frontend and backend are on different domains (Vercel vs Railway)
- **CORS**: In `config/cors.php`, set `allowed_origins` to your Vercel URL
- **Axios interceptor**: Attach `Authorization: Bearer {token}` to every request; on 401, redirect to login
- **Railway**: Use the built-in PostgreSQL plugin. No extra config needed — Railway injects `DATABASE_URL` automatically.
- **Vite build**: `npm run build` → Vercel auto-serves the `dist/` folder

---

## Verification / Testing Checklist

1. **Auth flow**: Register → Login → token in store → `/me` returns user → Logout clears token
2. **Role gating**: Login as requester → cannot see admin nav → cannot hit `/api/admin/users`
3. **Leave request creation**: Requester creates request → appears in list with `pending` status → `approval_steps` rows created in DB
4. **Multi-step approval**: Level 1 approver approves → status becomes `in_progress` → Level 2 approver sees it → Level 2 approves → status becomes `approved`
5. **Rejection short-circuit**: Any approver rejects → status becomes `rejected` → no further actions possible
6. **Admin panel**: Admin assigns role to a user → user role updates in DB → re-login reflects new role
7. **Deployed app**: Full flow works on live Vercel + Railway URLs

---

## Future Extensibility Notes (Not Week 1)
- Replace `leave_type` enum with a `request_types` table → generic workflow engine
- Add `workflow_templates` table to define reusable approval chain configs per request type
- Add email notifications via Laravel Queue + Mailgun
- Add audit log table for compliance tracking
