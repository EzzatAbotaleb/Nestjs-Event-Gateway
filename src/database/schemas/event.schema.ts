import { Schema, Document } from 'mongoose';

export type EventStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface EventDocument extends Document {
  eventId: string;
  status: EventStatus;
  payload: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export const EventSchema = new Schema<EventDocument>(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
