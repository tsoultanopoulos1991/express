# Notes

## Task 1 — Availability Caching

### Architecture
`GET /api/v1/products/:productId/availabilities` follows the same layered structure as the rest of the API: route → controller → `availabilityService`. The service owns both the simulated upstream and the Redis caching, using a **cache-aside** pattern (read cache → on miss, fetch upstream → store → return).

### Simulated upstream
`getUpstreamAvailability` generates data dynamically for **today** and **tomorrow** (relative to `new Date()`), so the demo data stays fresh regardless of when the project is run. Slots are **fixed** (`09:00`, `10:30`, `12:00`, each with 10 tickets at price 100) rather than randomised — this makes the cache contents deterministic, so a webhook `slot_start`/`travel_date` always maps to a real slot and the decrement is predictable and testable.

### TTL justification
`AVAILABILITY_CACHE_TTL` defaults to **3600s (1h)** — deliberately matched to the upstream refresh rate. Caching longer than the source refreshes would serve data the upstream has already replaced; caching shorter would waste the upstream's freshness window and add load. Configurable via env so it can be tuned (e.g. lowered for local testing).

Note: the TTL and the upstream's refresh aren't aligned in time, so worst case we can serve data up to 1h stale. In production we'd fix this by having the upstream signal a refresh (and we'd drop the cache then), keeping the TTL only as a fallback.

### Decrement behaviour
Bookings call `decrementSlot`, which mutates `available_tickets` for the matching `date`/`start` **in-place** and re-writes the entry **preserving the remaining TTL** (read via `redis.ttl`, not reset to the full value). This keeps availability accurate between hourly refreshes without extending the staleness window on every booking.

### Expired-at-decrement → 404
If the cache entry has expired by the time a booking tries to decrement it, `decrementSlot` throws a `404` and **does not re-fetch upstream** — re-fetching would invent a fresh availability snapshot and silently allow a booking against data we no longer trust. The error propagates through the webhook handler to a `404` response (see Task 2 for the booking rollback that keeps this consistent).



## Task 2 — Webhook Ingestion

### Payload design
The webhook payload wraps all booking fields under a `booking` object to keep the operator-level fields (`event_id`, `supplier_id`, `supplier_product_code`) clearly separated from the booking data. `event_id` is included for traceability — logged on every event so requests can be traced end-to-end, even though idempotency is not enforced (no deduplication store). In production, idempotency would be handled by persisting `event_id` and rejecting duplicates.

### Product lookup
The handler resolves the internal product via `product_suppliers` using `supplier_id` + `supplier_product_code`. If no mapping exists, it returns `404` — the booking is not created.

### Decrement behaviour & expired-cache rollback
The booking creation and the cache decrement run inside one Sequelize transaction. We create the booking first, then decrement. Per the spec, if the cache has expired the decrement throws `404` (and does **not** re-fetch upstream). That error rolls the transaction back, so the booking is never saved — no leftover rows to clean up. The operator can just retry once availability is cached again; a duplicate is impossible anyway because `reference_code` is unique.

The transaction covers only Postgres, not Redis. That's fine here: when the cache is missing, `decrementSlot` throws **before** touching Redis, so the `404` leaves Redis untouched. The only remaining edge case — Redis updated but the Postgres commit then fails — is the usual trade-off of writing to two stores and is acceptable at this scope.

### Unknown event types
Unknown events return `200` and are logged — they are not treated as errors. This follows the webhook convention of always acknowledging receipt, regardless of whether the event is actionable.

### Signature verification
No HMAC signature verification is implemented. In production, the operator's signature (typically sent as a request header) should be verified before processing any payload.

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
Added for manual testing only (not required by the assignment). The seeder already creates users `alice` (id=1) and `bob` (id=2), so no user creation is needed — `POST /api/v1/users` exists but is optional. See API docs (Swagger) for full reference.

1. `node scripts/generate-token.js 1` — generate a JWT for seeded user 1 (also prints tokens for user 2, a non-existent user, and admin)
2. `POST /api/v1/bookings` — create a booking
3. `POST /api/v1/bookings/:id/tickets` — add tickets
4. Test guards:
   - **404** — use the token for user 2 and try to cancel user 1's booking
   - **409** — cancel the same booking twice
   - **403** — use a ticket via `PATCH /api/v1/bookings/:id/tickets/:ticketId/use`, then try to cancel
   - **422** — create a booking with a `travel_date` in the past and try to cancel
5. `DELETE /api/v1/bookings/:id` — cancel

### Trade-offs
- Nested tickets route (`/bookings/:id/tickets`) — tickets have no meaning outside a booking
- `PATCH /:id/use` for ticket validation — partial update, not deletion
- Role in JWT vs DB roles table — simpler, sufficient for this scope; doesn't support runtime role changes without re-issuing tokens
