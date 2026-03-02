import { Controller, Post, Body, Logger } from '@nestjs/common';

@Controller('stub')
export class RoutingStubController {
  private readonly logger = new Logger(RoutingStubController.name);

  @Post('route')
  async route(@Body() body: { eventId: string; context: unknown }) {
    const { eventId, context } = body;
    this.logger.log(`Stub routing received event: ${eventId}`);
    await new Promise((res) => setTimeout(res, 2000));
    return {
      status: 'ok',
      routedEventId: eventId,
      decision: 'DEFAULT',
      receivedContext: context,
    };
  }
}
