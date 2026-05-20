# Coding Assessment

## Stack

**Node.js / Express.js**, any libraries you're comfortable with. Include a brief in `NOTES.md` covering your approach for each task.

## Simplified Data Model

```
users              id, email
bookings           id, user_id, reference_code, travel_date, deleted_at
booking_tickets    id, booking_id, ticket_code, used_at
product_suppliers  id, supplier_id, product_code, supplier_product_code
```

## Availability Caching

Build an endpoint that returns departure slot availability for a given product.

Simulate the upstream scheduling API in your codebase under `GET /products/{productId}/availabilities`. The simulated upstream response looks like this and refreshes the data every **1 hour**:

```json
{
  "2026-07-01": {
    "slots": [
      { "start": "09:00", "available_tickets": 12, "price": 100 },
      { "start": "10:00", "available_tickets": 3,  "price": 100 }
    ]
  },
  "2026-07-02": {
    "slots": [
      { "start": "09:00", "available_tickets": 0, "price": 100 },
      { "start": "10:00", "available_tickets": 1, "price": 100 }
    ]
  }
}
```

**Caching rules:**

- Cache responses in Redis with an appropriate TTL, choose a value you can justify  
- If the cache entry has expired at decrement time, return `404` — do not re-fetch upstream

**Tests**, write unit tests covering:

- Cache hit (returns cached data, does not call upstream)  
- Cache miss (fetches from upstream, applies filter, stores result)  
- Correct TTL is set on store  
- Decrement behavior (correct slot is updated in-place)  
- Decrement on expired cache returns `404`

## Webhook Ingestion

A third-party operator sends booking lifecycle events to your API via webhook.

Your handler must support the `created` event and the expected behavior is to look up the internal product via `product_suppliers`, create the corresponding booking

**Payload design is up to you.** There are no strict field requirements — define a payload structure that contains everything needed to complete the above operations, and document it in your `NOTES.md`

Your handler should also:

- After a booking is confirmed, decrement `available_tickets` in-place in the cache for the correct date and timeslot  
- Handle malformed payloads gracefully (missing fields, invalid JSON)  
- Handle unknown event types gracefully (do not throw — log and return an appropriate response)

## Booking Cancellation

Build a JWT-protected endpoint to cancel a booking.

Apply the following guard conditions in order:

| Condition | Status |
| :---- | :---- |
| Booking not found or belongs to a different user | `404` |
| Booking is already cancelled | `409` |
| One or more tickets have already been used | `403` |
| Travel date is in the past | `422` |

## Documentation
- A brief `INSTALL.md` with installation notes
- A brief `NOTES.md` explaining any architectural decisions or trade-offs you chose