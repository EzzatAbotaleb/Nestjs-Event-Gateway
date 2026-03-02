import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { QueueModule } from '../queue/queue.module';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [QueueModule, DatabaseModule],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
