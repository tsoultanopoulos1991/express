/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a user
 *     description: Public endpoint. Creates a new user with a unique email.
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   get:
 *     summary: Get all users
 *     description: |
 *       Returns all users.
 *       - **admin only** — returns `403` for non-admin tokens
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — admin role required
 *
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: |
 *       Returns a single user.
 *       - **admin only** — returns `403` for non-admin tokens
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — admin role required
 *       404:
 *         description: User not found
 */
