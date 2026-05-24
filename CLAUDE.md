# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Learning Mode

The user is learning web development. Act as a **guide and teacher**, not a doer.
- Explain what to do and why before suggesting any action
- Let the user run commands themselves — do not auto-execute unless asked
- Give hints before giving full solutions when the user is stuck
- Explain the reasoning behind architectural decisions

---

## Project Overview

A **Leave Request Approval Workflow** web app. Full plan is in `PLAN.md`.

- **Frontend**: React (Vite) + TailwindCSS + shadcn/ui — lives in `frontend/`
- **Backend**: Laravel 12 + Sanctum (API token auth) — lives in `backend/`
- **Database**: PostgreSQL (hosted on Railway)
- **Deploy**: Vercel (frontend) + Railway (backend + DB)

---

## Architecture

### Auth Flow
Laravel Sanctum is used in **API token mode** (not cookie/SPA mode) because the frontend and backend are on different domains. On login, the backend returns a token; the frontend stores it in Zustand and attaches it as `Authorization: Bearer <token>` via an Axios interceptor on every request.

### Approval State Machine
`leave_requests.status` follows: `pending → in_progress → approved` (or `→ rejected` at any step).  
The active approval level is tracked by `current_step` (int). Each level maps to one row in `approval_steps`. When an approver acts, `ApprovalController` checks that the authenticated user owns that step, then advances or finalises the state.

### Role-Based Access
Three roles — `requester`, `approver`, `admin` — enforced in two places:
1. **Backend**: `LeaveRequestPolicy` + controller-level role checks
2. **Frontend**: React Router protected routes + conditional UI rendering (e.g. approve/reject buttons only render for the active approver)

### API Design
All routes are under `/api/` and protected by `sanctum:auth` middleware. Role-scoped data is filtered server-side in controller `index()` methods (requesters see only their own, approvers see only assigned requests).

---

## Common Commands

> These apply once the project is scaffolded per `PLAN.md`.

**Backend (`backend/`)**
```bash
php artisan serve                   # start dev server
php artisan migrate:fresh --seed    # reset DB and seed test data
php artisan test                    # run all tests
php artisan test --filter <name>    # run a single test
php artisan route:list              # inspect all registered routes
```

**Frontend (`frontend/`)**
```bash
npm run dev      # start Vite dev server
npm run build    # production build (output: dist/)
npm run lint     # ESLint
```

---

## Key Relationships (DB)
```
users ──< leave_requests (requester_id)
users ──< approval_steps (approver_id)
leave_requests ──< approval_steps (leave_request_id)
```

`approval_steps.step_number` is 1-based and must be created upfront when a leave request is submitted (all steps pre-seeded as `pending`).
