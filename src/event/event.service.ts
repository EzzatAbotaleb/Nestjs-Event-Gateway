import { Injectable } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { EventRepository } from '@database/event.repository';
import type { EventPayload } from '../queue/queue.types';

/**
 * Event ingestion service.
 * Responsible for enqueueing events to the queue (thin ingestion layer).
 */
@Injectable()
export class EventService {
  constructor(
    private readonly queueService: QueueService,
    private readonly eventRepository: EventRepository, // <-- inject repository
  ) {}

  /**
   * Enqueue an event for async processing.
   * @param payload - Event payload
   * @param idempotencyKey - Unique key for idempotency
   * @returns Job id or acknowledgment id
   */
  async enqueue(payload: EventPayload, idempotencyKey: string): Promise<string> {
    await this.eventRepository.createIfNotExists(idempotencyKey, payload);
    return this.queueService.addEvent({
      payload,
      idempotencyKey,
      receivedAt: new Date().toISOString(),
    });
  }
}
