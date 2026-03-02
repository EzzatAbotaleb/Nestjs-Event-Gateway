import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventDocument } from './schemas/event.schema';

@Injectable()
export class EventRepository {
  constructor(@InjectModel('Event') private readonly eventModel: Model<EventDocument>) {}

  async createIfNotExists(eventId: string, payload: unknown) {
    return this.eventModel.updateOne(
      { eventId },
      {
        $setOnInsert: { eventId, payload, status: 'pending' },
      },
      { upsert: true },
    );
  }

  async markProcessing(eventId: string) {
    return this.eventModel.updateOne({ eventId }, { status: 'processing' });
  }

  async markCompleted(eventId: string) {
    return this.eventModel.updateOne({ eventId }, { status: 'completed' });
  }

  async markFailed(eventId: string) {
    return this.eventModel.updateOne({ eventId }, { status: 'failed' });
  }

  async getStatus(eventId: string): Promise<string | null> {
    const event = await this.eventModel.findOne({ eventId }).lean();
    return event?.status ?? null;
  }
}
