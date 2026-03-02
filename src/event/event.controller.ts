import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { HmacGuard } from '../common/hmac/hmac.guard';
import { IngestEventDto } from './dto/ingest-event.dto';
import { IngestEventResponseDto } from './dto/ingest-event-response.dto';

/**
 * Event ingestion controller.
 * Thin layer: validate HMAC, validate DTO, enqueue, return 202. No processing in request path.
 */

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(HmacGuard)
  async ingest(@Body() dto: IngestEventDto): Promise<IngestEventResponseDto> {
    const id = await this.eventService.enqueue(dto.payload ?? {}, dto.eventId);
    return { accepted: true, id };
  }
}
