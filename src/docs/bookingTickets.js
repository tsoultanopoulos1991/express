/**
 * @swagger
 * /api/v1/bookings/{bookingId}/tickets:
 *   get:
 *     summary: Get tickets for a booking
 *     description: |
 *       Returns all tickets for a booking.
 *       - **admin**: can retrieve tickets for any booking
 *       - **user**: can only retrieve tickets for their own booking — returns `404` if the booking belongs to a different user
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookingTicket'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       404:
 *         description: Booking not found or belongs to a different user
 *
 *   post:
 *     summary: Add a ticket to a booking
 *     description: |
 *       Creates a new ticket for a booking.
 *       - **admin**: can add tickets to any booking
 *       - **user**: can only add tickets to their own booking — returns `404` if the booking belongs to a different user
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ticket_code]
 *             properties:
 *               ticket_code:
 *                 type: string
 *                 example: TK-20260701-001
 *     responses:
 *       201:
 *         description: Ticket created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingTicket'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       404:
 *         description: Booking not found or belongs to a different user
 *
 * /api/v1/bookings/{bookingId}/tickets/{ticketId}/use:
 *   patch:
 *     summary: Mark a ticket as used
 *     description: |
 *       Sets `used_at` to the current timestamp. Cannot be undone.
 *       - **admin**: can use any ticket
 *       - **user**: can only use tickets on their own bookings — returns `404` if the booking belongs to a different user
 *
 *       Guard conditions:
 *       1. `404` — booking not found or belongs to a different user
 *       2. `409` — booking is cancelled
 *       3. `404` — ticket not found
 *       4. `409` — ticket already used
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket marked as used
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingTicket'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       404:
 *         description: Booking or ticket not found
 *       409:
 *         description: Ticket already used or booking is cancelled
 */
