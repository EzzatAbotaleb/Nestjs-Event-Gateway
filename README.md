# Event Gateway

Resilient Event Orchestration Gateway — NestJS modular monolith with Clean Architecture.

## Structure

- **common** — HMAC validator, idempotency helper
- **database** — MongoDB (Mongoose) schemas
- **event** — Ingestion controller and service (thin layer)
- **queue** — BullMQ queue service and processor
- **routing** — Routing service client and stub (simulated delay)

## Run

```bash
cp .env.example .env
npm install
# Start Redis and MongoDB (e.g. docker-compose up -d redis mongo)
npm run start:dev
```

Or run full stack:

```bash
docker-compose up --build
```

API: `http://localhost:3000`  
Routing stub (simulated 2s latency): `POST http://localhost:3000/stub/route`

## Ingest an event (HMAC)

`POST /events` requires an `x-signature` header containing the hex-encoded HMAC-SHA256 of the **raw** request body, signed with `HMAC_SECRET`.

Example body:

```json
{
  "eventId": "evt_123",
  "payload": { "orderId": "ord_1" }
}
```

## DLQ strategy

- **When used**: a job is pushed to the `events-dlq` queue **only after** all retry attempts are exhausted.
- **What is stored**: original job id, idempotency key, attempts made, payload, and failure reason.
- **What to do next**: the DLQ processor logs the record and marks the event as `failed`. In a production setup, you would persist DLQ jobs to a dedicated collection and/or alert (PagerDuty/Slack) for manual replay.

## Eventual consistency

- **Client contract**: ingestion returns `202 Accepted` immediately after enqueueing (thin ingestion layer).
- **Consistency model**: downstream effects (Mongo writes + routing decision) are applied asynchronously by workers; clients should treat the system as eventually consistent.
- **Idempotency**: event processing is guarded by Redis `SET NX EX` so duplicates do not re-run business logic.

## Proof of load (100 concurrent requests)

Run the included load script which:
- signs requests with HMAC
- sends 100 concurrent `POST /events`
- reports success/failure counts

```bash
npm run start:dev
npm run load-test
```

## Requirements

- Node 20+
- Redis
- MongoDB
