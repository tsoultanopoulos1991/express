# Notes

## Task 3 — Booking Cancellation

### Architecture
Layered: **routes** (HTTP only) → **controllers** (orchestration) → **services** (business logic + DB). Validators live in `src/validators/<resource>.js` as named exports to keep routes readable. A shared `asyncHandler` utility eliminates try/catch boilerplate in controllers. All errors flow to a single `src/middleware/errorHandler.js`.

### Auth & RBAC
Single `JWT_SECRET`, `role` claim (`user` | `admin`) controls access. Role in JWT avoids a DB lookup per request — acceptable for this scope. Ownership is enforced in the service layer via `user_id` from the JWT claim — not from the request body. See Swagger (`/api-docs`) for per-endpoint access details.

### Guard Order
Applied as specified: 404 → 409 → 403 → 422. The 404 intentionally covers both "not found" and "wrong user" to avoid leaking booking existence.

### Soft Delete
`deleted_at` timestamp rather than hard delete — preserves history, aligns with the schema.

### Additional Endpoints & Testing Flow
Added for manual testing only (not required by the assignment). See API docs (Swagger) for full reference.

1. `POST /api/v1/users` — create user
2. `node scripts/generate-token.js <user_id>` — generate JWT
3. `POST /api/v1/bookings` — create booking
4. `POST /api/v1/bookings/:id/tickets` — add tickets
5. Test guards:
   - **404** — use a token for a different user (`node scripts/generate-token.js 2`) and try to cancel user 1's booking
   - **409** — cancel the same booking twice
   - **403** — use a ticket via `PATCH /api/v1/bookings/:id/tickets/:ticketId/use`, then try to cancel
   - **422** — create a booking with a `travel_date` in the past and try to cancel
6. `DELETE /api/v1/bookings/:id` — cancel

### Trade-offs
- Nested tickets route (`/bookings/:id/tickets`) — tickets have no meaning outside a booking
- `PATCH /:id/use` for ticket validation — partial update, not deletion
- Role in JWT vs DB roles table — simpler, sufficient for this scope; doesn't support runtime role changes without re-issuing tokens
