import { IsString, IsOptional, IsObject } from 'class-validator';

/**
 * DTO for event ingestion request body.
 */
export class IngestEventDto {
  @IsString()
  eventId: string;
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
