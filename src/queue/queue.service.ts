import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DlqJobData, ProcessEventJobData } from './queue.types';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('events') private readonly eventQueue: Queue,
    @InjectQueue('events-dlq') private readonly dlqQueue: Queue,
  ) {}

  async addEvent(event: ProcessEventJobData): Promise<string> {
    try {
      const job = await this.eventQueue.add('process-event', event, {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        jobId: event.idempotencyKey,
      });
      return job.id as string;
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : '';
      const message = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
      // BullMQ throws when a jobId already exists; treat this as a duplicate ingestion.
      if (name === 'JobAlreadyExistsError' || `${message ?? ''}`.includes('already exists')) {
        return String(event.idempotencyKey);
      }
      throw err;
    }
  }

  async addToDLQ(event: DlqJobData): Promise<string> {
    const job = await this.dlqQueue.add('dlq-job', event, {
      removeOnComplete: true,
    });
    return job.id as string;
  }
}
