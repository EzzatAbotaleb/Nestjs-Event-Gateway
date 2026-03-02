import { Schema, Document } from 'mongoose';

export interface OrderDocument extends Document {
  orderId: string;
  eventId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = new Schema<OrderDocument>(
  {
    orderId: { type: String, required: true, index: true },
    eventId: { type: String, required: true, unique: true, index: true },
    status: { type: String, required: true },
  },
  { timestamps: true },
);
