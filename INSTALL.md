# Install

## Requirements

- Docker & Docker Compose
- The following host ports free (mapped by `docker compose`):
  - `3000` — Express app (the `PORT` value in `.env`)
  - `6379` — Redis
  - `5433` — Postgres (mapped to the container's `5432`, chosen to avoid clashing with a local Postgres on `5432`)


## Run

```bash
cp .env.example .env
docker compose up --build
```

This will:
1. Start PostgreSQL and Redis
2. Run database migrations
3. Seed demo data (skipped if data already exists)
4. Start the Express server on the port defined in `.env` (default `3000`)

Once it's up, the API is available at `http://localhost:3000` and the Swagger UI at `http://localhost:3000/api-docs`.

## Demo data

The seeder creates:
- 2 users: `alice@example.com` (id=1), `bob@example.com` (id=2)
- 2 product-supplier mappings:
  - `supplier_id=1` + `PROD-EXT-001` → `product-1`
  - `supplier_id=1` + `PROD-EXT-002` → `product-2`

## Generate JWT tokens

With the stack running, in a second terminal:

```bash
docker compose exec app node scripts/generate-token.js <user_id>
```

Generates tokens for user `<user_id>`, user 2, a non-existent user (id=9999), and admin.

## Run tests

With the stack running, in a second terminal:

```bash
docker compose exec app npm test
```
