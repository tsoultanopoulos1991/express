/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: List all products
 *     description: Returns all product supplier mappings. Use `product_code` as the `productId` in the availability endpoint. Requires admin role.
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of product suppliers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   supplier_id:
 *                     type: integer
 *                     example: 1
 *                   product_code:
 *                     type: string
 *                     example: product-1
 *                   supplier_product_code:
 *                     type: string
 *                     example: PROD-EXT-001
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: User is not admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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
 *         description: Internal product identifier (use `product_code` from `product_suppliers`, e.g. `product-1`)
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
