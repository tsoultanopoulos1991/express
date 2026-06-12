/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     summary: Get bookings
 *     description: |
 *       Returns a list of bookings.
 *       - **admin**: returns all bookings
 *       - **user**: returns only their own bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *
 *   post:
 *     summary: Create a booking
 *     description: Creates a booking for the authenticated user. The `user_id` is taken from the JWT claim, not the request body.
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reference_code, travel_date]
 *             properties:
 *               reference_code:
 *                 type: string
 *                 example: BK-20260701-001
 *               travel_date:
 *                 type: string
 *                 format: date
 *                 example: '2026-07-15'
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *
 * /api/v1/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     description: |
 *       Returns a single booking with its tickets.
 *       - **admin**: can retrieve any booking
 *       - **user**: can only retrieve their own booking — returns `404` if the booking belongs to a different user
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       404:
 *         description: Booking not found or belongs to a different user
 *
 *   delete:
 *     summary: Cancel a booking
 *     description: |
 *       Soft-deletes a booking by setting `deleted_at`. Only the owner can cancel their own booking.
 *       Guards are applied in order:
 *       1. `404` — booking not found or belongs to a different user
 *       2. `409` — booking already cancelled
 *       3. `403` — one or more tickets have already been used
 *       4. `422` — travel date is in the past
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Booking cancelled
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: One or more tickets have already been used
 *       404:
 *         description: Booking not found or belongs to a different user
 *       409:
 *         description: Booking already cancelled
 *       422:
 *         description: Travel date is in the past
 */
