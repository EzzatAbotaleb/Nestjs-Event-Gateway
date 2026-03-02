import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { HmacGuard } from '../common/hmac/hmac.guard';

describe('EventController', () => {
  let controller: EventController;
  let eventService: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        { provide: EventService, useValue: { enqueue: jest.fn().mockResolvedValue('job-123') } },
      ],
    })
      .overrideGuard(HmacGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EventController>(EventController);
    eventService = module.get<EventService>(EventService);
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('ingest returns 202-style response with accepted and id', async () => {
    const dto = { eventId: 'evt_abc', payload: { type: 'tracking' } };
    const result = await controller.ingest(dto);
    expect(result).toEqual({ accepted: true, id: 'job-123' });
    expect(eventService.enqueue).toHaveBeenCalledWith(
      { eventId: 'evt_abc', payload: { type: 'tracking' } },
      'evt_abc',
    );
  });
});
