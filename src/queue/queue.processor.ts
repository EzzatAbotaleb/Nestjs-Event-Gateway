import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { IdempotencyHelper } from '@common/idempotency/idempotency.helper';
import { EventRepository } from '../database/event.repository';
import { QueueService } from './queue.service';
import { RoutingService } from '../routing/routing.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDocument } from '../database/schemas/order.schema';
import { ShipmentDocument } from '../database/schemas/shipment.schema';
import { ProcessEventJobData } from './queue.types';

@Injectable()
@Processor('events')
export class QueueProcessor extends WorkerHost {
  private readonly logger = new Logger(QueueProcessor.name);

  constructor(
    private readonly idempotencyHelper: IdempotencyHelper,
    private readonly eventRepository: EventRepository,
    private readonly queueService: QueueService,
    private readonly routingService: RoutingService,
    @InjectModel('Order') private readonly orderModel: Model<OrderDocument>,
    @InjectModel('Shipment') private readonly shipmentModel: Model<ShipmentDocument>,
  ) {
    super();
  }

  protected getWorkerOptions() {
    return {
      concurrency: Number(process.env.WORKER_CONCURRENCY ?? 10),
    };
  }

  async process(job: Job<ProcessEventJobData>) {
    const { idempotencyKey, payload } = job.data;

    try {
      const { executed } = await this.idempotencyHelper.executeOnce(idempotencyKey, async () => {
        await this.eventRepository.markProcessing(idempotencyKey);

        const orderId = payload?.orderId ?? 'unknown';

        // Contextual awareness: retrieve current state from MongoDB
        const [existingOrders, existingShipments] = await Promise.all([
          this.orderModel.find({ orderId }).lean(),
          this.shipmentModel.find({ orderId }).lean(),
        ]);

        // Business logic (idempotent across retries)
        await this.orderModel.updateOne(
          { eventId: idempotencyKey },
          { $setOnInsert: { orderId, eventId: idempotencyKey, status: 'created' } },
          { upsert: true },
        );
        await this.shipmentModel.updateOne(
          { eventId: idempotencyKey },
          { $setOnInsert: { orderId, eventId: idempotencyKey, status: 'created' } },
          { upsert: true },
        );

        // Routing
        await this.routingService.route(idempotencyKey, {
          payload,
          existingOrders,
          existingShipments,
        });

        await this.eventRepository.markCompleted(idempotencyKey);
        this.logger.log(`Job ${job.id} completed successfully`);
      });

      if (!executed) {
        this.logger.warn(`Duplicate job skipped for key: ${idempotencyKey}`);
        return;
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error';
      this.logger.error(`Job ${job.id} failed: ${message}`);
      const maxAttempts = job.opts.attempts ?? 1;
      const attemptNumber = job.attemptsMade + 1;
      const isFinalAttempt = attemptNumber >= maxAttempts;

      if (isFinalAttempt) {
        await this.eventRepository.markFailed(idempotencyKey);

        // Push to DLQ after retries are exhausted
        await this.queueService.addToDLQ({
          originalJobId: String(job.id),
          payload,
          failedReason: message,
          attemptsMade: attemptNumber,
          idempotencyKey,
        });
      }

      throw err;
    }
  }
}
