import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueProcessor } from './queue.processor';
import { DlqProcessor } from './dlq.proecessor';
import { QueueService } from './queue.service';
import { DatabaseModule } from '../database/database.module';
import { RoutingModule } from '../routing/routing.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'events' }),
    BullModule.registerQueue({ name: 'events-dlq' }),
    DatabaseModule,
    RoutingModule,
  ],
  providers: [QueueProcessor, DlqProcessor, QueueService],
  exports: [QueueService],
})
export class QueueModule {}
