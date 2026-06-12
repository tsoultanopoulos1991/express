/**
 * @swagger
 * /api/v1/products/{productId}/availabilities:
 *   get:
 *     summary: Get product availability
 *     description: |
 *       Returns departure slot availability for a product, keyed by date.
 *
 *       Data comes from a simulated upstream scheduling API (refreshes hourly) and is
 *       cached in Redis using a cache-aside strategy:
 *       - **cache hit** — returns the cached payload, upstream is not called
 *       - **cache miss** — fetches from upstream, stores it with a TTL, then returns it
 *
 *       The TTL matches the upstream refresh rate (1h by default, configurable via
 *       `AVAILABILITY_CACHE_TTL`). Bookings decrement `available_tickets` in-place
 *       without resetting the TTL. Public endpoint — no authentication required.
 *     tags: [Availability]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Internal product identifier
 *     responses:
 *       200:
 *         description: Availability keyed by date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 properties:
 *                   slots:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           example: '09:00'
 *                         available_tickets:
 *                           type: integer
 *                           example: 12
 *                         price:
 *                           type: number
 *                           example: 100
 *             example:
 *               '2026-07-01':
 *                 slots:
 *                   - start: '09:00'
 *                     available_tickets: 12
 *                     price: 100
 *                   - start: '10:00'
 *                     available_tickets: 3
 *                     price: 100
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
