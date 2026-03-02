export type EventPayload = Record<string, unknown> & { orderId?: string };

export interface ProcessEventJobData {
  payload: EventPayload;
  idempotencyKey: string;
  receivedAt: string;
}

export interface DlqJobData {
  originalJobId: string;
  idempotencyKey: string;
  payload: EventPayload;
  failedReason: string;
  attemptsMade: number;
}
