import { Schema, Document } from 'mongoose';

export interface ShipmentDocument extends Document {
  eventId: string;
  orderId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ShipmentSchema = new Schema<ShipmentDocument>(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    status: { type: String, required: true },
  },
  { timestamps: true },
);
