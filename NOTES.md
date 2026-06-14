# Notes

## Task 1 — Availability Caching

### Architecture
`GET /api/v1/products/:productId/availabilities` follows the same layered structure as the rest of the API: route → controller → `availabilityService`. The service owns both the simulated upstream and the Redis caching, using a **cache-aside** pattern (read cache → on miss, fetch upstream → store → return).

### Simulated upstream
`getUpstreamAvailability` generates data dynamically for **today** and **tomorrow** (relative to `new Date()`), with randomised slots, ticket counts and prices on every fetch. This keeps the demo data fresh regardless of when the project is run, and makes a cache miss visibly different from a cache hit.

### TTL justification
`AVAILABILITY_CACHE_TTL` defaults to **3600s (1h)** — deliberately matched to the upstream refresh rate. Caching longer than the source refreshes would serve data the upstream has already replaced; caching shorter would waste the upstream's freshness window and add load. Matching the two means a cached entry is never more stale than the upstream itself. Configurable via env so it can be tuned (e.g. lowered for local testing).

### Decrement behaviour
Bookings call `decrementSlot`, which mutates `available_tickets` for the matching `date`/`start` **in-place** and re-writes the entry **preserving the remaining TTL** (read via `redis.ttl`, not reset to the full value). This keeps availability accurate between hourly refreshes without extending the staleness window on every booking.

### Expired-at-decrement → 404
If the cache entry has expired by the time a booking tries to decrement it, `decrementSlot` throws a `404` and **does not re-fetch upstream** — re-fetching would invent a fresh availability snapshot and silently allow a booking against data we no longer trust. The error propagates through the webhook handler to a `404` response (see Task 2 for the booking rollback that keeps this consistent).

### Redis resilience
The Redis client is configured with `enableOfflineQueue: false` and `retryStrategy: () => null` so the app starts and stays up even if Redis is unavailable. Cache operations in `availabilityService` are wrapped in try/catch — on any Redis error, the service falls back to upstream data directly and logs a warning. The endpoint returns 200 with live data instead of 500.

### Tests
`tests/availabilityService.test.js` covers all required cases against a mocked Redis client: cache hit (no upstream/store call), cache miss (fetches + stores), correct TTL on store, in-place decrement of the right slot, and decrement-on-expired throwing `404`.

## Task 2 — Webhook Ingestion

### Payload design
The webhook payload wraps all booking fields under a `booking` object to keep the operator-level fields (`event_id`, `supplier_id`, `supplier_product_code`) clearly separated from the booking data. `event_id` is included for traceability — logged on every event so requests can be traced end-to-end, even though idempotency is not enforced (no deduplication store). In production, idempotency would be handled by persisting `event_id` and rejecting duplicates.

### Product lookup
The handler resolves the internal product via `product_suppliers` using `supplier_id` + `supplier_product_code`. If no mapping exists, it returns `404` — the booking is not created.

### Decrement behaviour & expired-cache rollback
After a booking is created, `decrementSlot` is called for the matching date and slot. Per the spec, if the cache has expired at decrement time the operation returns `404` and does **not** re-fetch upstream. Since the booking is created before the decrement, the handler rolls it back (`destroy`) before letting the `404` propagate — so an expired cache leaves no orphaned booking. The operator's retry, once availability has been re-cached, then creates the booking cleanly. Duplicate bookings on retry are impossible regardless, since `reference_code` is unique.

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
