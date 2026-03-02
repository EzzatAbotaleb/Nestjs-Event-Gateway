import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { EventRepository } from '../database/event.repository';
import { DlqJobData } from './queue.types';

@Injectable()
@Processor('events-dlq')
export class DlqProcessor extends WorkerHost {
  private readonly logger = new Logger(DlqProcessor.name);

  constructor(private readonly eventRepository: EventRepository) {
    super();
  }

  async process(job: Job<DlqJobData>) {
    const { payload, originalJobId, failedReason, idempotencyKey } = job.data;

    this.logger.warn(`DLQ Job received: ${originalJobId}`);
    this.logger.warn(`Payload: ${JSON.stringify(payload)}`);
    this.logger.warn(`Reason: ${failedReason}`);

    await this.eventRepository.markFailed(idempotencyKey);

    // Optional: store in separate DLQ collection or send alert
    return { status: 'stored-in-dlq' };
  }
}
