## AI Disclosure

This project was reviewed and updated with the help of Cursor (AI-assisted coding) on 2026-03-02.

## Prompts used

## PROMPT 1


Create a production-grade NestJS project using Clean Architecture for a Resilient Event Orchestration Gateway.

Requirements:

- Use NestJS
- Use BullMQ with Redis
- Use MongoDB with Mongoose
- Modular monolith structure

Modules required:

event module:
- controller
- service

queue module:
- queue service
- queue processor

routing module:
- simulate external routing service with delay

database module:
- Mongo schemas

common module:
- HMAC validator
- idempotency helper

Requirements:

- Separation of concerns
- scalable structure
- production folder structure

Do NOT implement logic yet.
Only structure and files.

## PROMPT 2
Implement Event Controller in NestJS.

Requirements:

POST /events endpoint

Responsibilities:

- receive event payload
- validate HMAC signature from header x-signature
- reject if invalid

If valid:

- push event to BullMQ queue

Response:

return success immediately

Response time must be fast.

Use DTO validation.

Do not process event inside controller.

## PROMPT 3
Create reusable HMAC validation service in NestJS.

Requirements:

- use sha256
- read secret from env

Method:

validateSignature(payload, signature): boolean

Must be secure.

Use crypto library.

## PROMPT 4 
Create MongoDB schema for event tracking.

Fields:

eventId (unique)

status:
pending
processing
completed
failed

payload

createdAt

Requirements:

eventId must be unique to ensure idempotency.

Add repository methods:

findByEventId

createEvent

updateStatus

## PROMPT 5
Create BullMQ queue service in NestJS.

Requirements:

- Redis connection
- Queue name: events

Method:

addEventToQueue(event)

Job config:

attempts: 5

backoff:

type: exponential

delay: 1000

Remove completed jobs automatically.

## PROMPT 6
Create BullMQ processor in NestJS.

Responsibilities:

Process event from queue.

Steps:

1 check idempotency:

if event already completed → skip

2 update status to processing

3 call routing service

4 update status to completed

5 handle failure:

update status to failed

Retry must be handled automatically by BullMQ.

Do NOT block event loop.

Use async properly.

Add logging.

## PROMPT 7
- "Check the attached backend assessment PDF requirements and verify whether the project fulfills all requested concepts/technicalities; run the project and validate functionality end-to-end."
- "Fix gaps: make routing stub simulate 2-second latency; ensure docker-compose starts the full environment; make ingestion idempotent and always return 202 on duplicates; implement exponential backoff retries and DLQ only after retries; document DLQ + eventual consistency; add a 100-concurrent-request load test script with HMAC signing."

