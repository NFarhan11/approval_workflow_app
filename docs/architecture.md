# Architecture Documentation

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | Auto-increment |
| name | string | |
| email | string unique | |
| password | hashed string | Stored as bcrypt hash, never plain text |
| role | enum | `requester`, `approver`, `admin` — defaults to `requester` |
| department | string nullable | Optional, for display/grouping |
| timestamps | | `created_at`, `updated_at` |

---

### `leave_requests`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | Auto-increment |
| requester_id | FK → users | The user who submitted the request. Cascades on delete |
| leave_type | enum | `annual`, `sick`, `emergency`, `unpaid` |
| start_date | date | Start of the leave period |
| end_date | date | End of the leave period |
| reason | text | Why the leave is being requested |
| status | enum | `pending`, `in_progress`, `approved`, `rejected` — defaults to `pending` |
| current_step | int (unsigned) | Which approval level is currently active (1-based) |
| total_steps | int (unsigned) | Total number of approvers in the chain |
| timestamps | | `created_at`, `updated_at` |

---

### `approval_steps`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | Auto-increment |
| leave_request_id | FK → leave_requests | Which request this step belongs to. Cascades on delete |
| approver_id | FK → users | Which user is the approver for this step |
| step_number | int (unsigned) | Order in the chain — 1 = first approver, 2 = second, etc. |
| status | enum | `pending`, `approved`, `rejected` — defaults to `pending` |
| comment | text nullable | Optional note the approver can leave when acting |
| actioned_at | timestamp nullable | When the approver approved or rejected |
| timestamps | | `created_at`, `updated_at` |

---

## Relationships

```
users ──< leave_requests      (via requester_id)
users ──< approval_steps      (via approver_id)
leave_requests ──< approval_steps  (via leave_request_id)
```

---

## Approval State Machine

`leave_requests.status` follows this flow:

```
pending
  └── [Level 1 approves] ──► in_progress
                                └── [Level 2 approves] ──► approved
  └── [Any level rejects] ──► rejected
```

- `current_step` tracks which approval level is active
- When an approver acts, `current_step` is incremented if more steps remain
- If `current_step == total_steps` and approved → status becomes `approved`
- Any rejection at any step → status immediately becomes `rejected` (short-circuit)
- All `approval_steps` rows are **pre-created** when a leave request is submitted

---

## Role-Based Access

| Role | Permissions |
|---|---|
| `requester` | Create requests, view own requests only |
| `approver` | View requests assigned to them, approve or reject |
| `admin` | View all requests, manage users, assign roles |

Enforced in two places:
1. **Backend** — `LeaveRequestPolicy` + controller-level role checks
2. **Frontend** — Protected routes + conditional UI rendering

---

## Auth Flow

- Auth is handled by **Laravel Sanctum in API token mode** (not cookie/SPA mode)
- On login, backend returns a plain text token
- Frontend stores token in **Zustand** and attaches it as `Authorization: Bearer <token>` via an Axios interceptor on every request
- On logout, only the **current token** is deleted (other device sessions unaffected)

---

## API Routes

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout          ← protected
GET    /api/auth/me              ← protected

GET    /api/leave-requests       ← filtered by role automatically
POST   /api/leave-requests       ← requester only
GET    /api/leave-requests/{id}
DELETE /api/leave-requests/{id}  ← own + pending only

POST   /api/leave-requests/{id}/approve   ← body: { comment }
POST   /api/leave-requests/{id}/reject    ← body: { comment }

GET    /api/admin/users
PATCH  /api/admin/users/{id}/role         ← body: { role }
GET    /api/admin/approvers

GET    /api/dashboard/stats
```
