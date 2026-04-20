# Authentication and Authorization

## Overview

Every community member has a login. The server requires authentication for any action that changes state. Some actions require a second member to confirm before they execute.

---

## Authentication

### Credentials

A member authenticates with their **handle** and a **PIN**. The handle is their unique community identifier (lowercase alphanumeric + underscores). The PIN is a short numeric or alphanumeric code they set themselves.

PINs are stored as SHA-256 hashes — the server never stores the plain-text PIN.

### Session Tokens

On successful login, the server issues a session token. The token is an opaque string that maps to the authenticated member's ID. All subsequent requests carry the token in the `Authorization` header.

Sessions have a configurable expiry. A session that has been idle longer than the expiry is invalidated and the member must log in again.

Sessions can be stored in memory (lost on restart) or persisted to disk. In-memory is acceptable for a community node where restarts are infrequent and members can simply log in again.

### Login Flow

```
POST /api/auth/login
{ "handle": "alice", "pin": "1234" }

→ 200 { "token": "...", "memberId": "...", "expiresAt": "..." }
→ 401 if credentials are invalid
```

---

## Authorization

### Read vs. Write

Read endpoints (GET) are public — any member or observer can read community data. This is consistent with the constitutional principle of ledger transparency.

Write endpoints (POST, PATCH, DELETE) require a valid session token. The authenticated member is considered the initiator of the action.

### Single-Member Actions

Some writes can be performed by the initiating member alone:

- Creating a marketplace post
- Updating your own member profile fields
- Submitting a proposal

These require authentication but not a second signer.

### Two-Member Actions

Some writes require a second member to explicitly confirm before they execute. The pattern:

1. Member A initiates the action — the server creates a **pending action** and returns its ID
2. Member B logs in, reviews the pending action, and approves it
3. The server executes the action and returns the result

If Member B rejects it, the action is cancelled. Pending actions expire after a configurable window (default: 24 hours).

Actions requiring two-member confirmation:

- Transfers between accounts
- Registering a new member
- Discharging a member
- Changing another member's PIN
- Funding or defunding a community role

The second signer can be any authenticated member other than the initiator, unless the action type specifies a required role (e.g. a treasurer role for large transfers).

### Proposal-Gated Actions

Some actions are more consequential and require the full governance process — a proposal, a deliberation period, and a vote by the community. These are not executed immediately regardless of who approves them:

- Constitutional amendments
- Electing a member to a position
- Allocating or reallocating domain budgets
- Changing community-wide parameters

These go through `GovernanceService`. The action executes automatically when the proposal passes.

---

## Implementation Plan

### Phase 1 — Login and Sessions
- `POST /api/auth/login` — verifies handle + PIN, returns session token
- `POST /api/auth/logout` — invalidates the session token
- Auth middleware that resolves a token to a member and attaches it to the request
- All write endpoints require a valid session

### Phase 2 — Two-Member Confirmation
- `PendingAction` — a server-side record holding the serialized action, initiator ID, creation time, and status
- `POST /api/actions/:id/approve` — second member approves; action executes
- `POST /api/actions/:id/reject` — second member rejects; action is cancelled
- `GET /api/actions/pending` — list pending actions awaiting your confirmation
- Wrap transfer, member registration, and discharge endpoints to go through this flow

### Phase 3 — Proposal-Gated Actions
- Expose `GovernanceService` over HTTP
- `POST /api/proposals` — submit a proposal
- `POST /api/proposals/:id/vote` — cast a vote
- `POST /api/proposals/:id/close` — close and tally (if deliberation period has ended)
- `GET /api/proposals` — list proposals (filterable by status)
- Hook proposal passage to action execution for governance-level mutations
