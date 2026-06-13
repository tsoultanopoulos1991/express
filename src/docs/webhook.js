/**
 * @swagger
 * /api/v1/webhook:
 *   post:
 *     summary: Ingest a booking lifecycle event from a third-party operator
 *     description: |
 *       Receives webhook events from external operators. Currently supports the `created` event.
 *
 *       **On `created`:**
 *       - Looks up the internal product via `product_suppliers` using `supplier_id` and `supplier_product_code`
 *       - Creates a booking in the database
 *       - Decrements `available_tickets` in-place in the Redis availability cache for the matching date and slot
 *
 *       **Unknown event types** are acknowledged with `200` and logged — they do not cause an error.
 *
 *       **Malformed payloads** (missing fields, wrong types) return `422`.
 *
 *       Public endpoint — no authentication required.
 *     tags: [Webhook]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [event_id, event, supplier_id, supplier_product_code, booking]
 *             properties:
 *               event_id:
 *                 type: string
 *                 example: evt-abc123
 *               event:
 *                 type: string
 *                 example: created
 *               supplier_id:
 *                 type: integer
 *                 example: 1
 *               supplier_product_code:
 *                 type: string
 *                 example: PROD-EXT-001
 *               booking:
 *                 type: object
 *                 required: [user_id, reference_code, travel_date, slot_start]
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   reference_code:
 *                     type: string
 *                     example: REF-001
 *                   travel_date:
 *                     type: string
 *                     format: date
 *                     example: '2026-07-01'
 *                   slot_start:
 *                     type: string
 *                     example: '09:00'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Booking created
 *                 booking_id:
 *                   type: integer
 *                   example: 1
 *       200:
 *         description: Event type not supported — acknowledged and ignored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Event type "cancelled" is not supported — ignored'
 *       404:
 *         description: Product not found for the given supplier_id and supplier_product_code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error — missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
