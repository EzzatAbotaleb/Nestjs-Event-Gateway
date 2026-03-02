import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);
  private readonly httpClient: AxiosInstance;
  private readonly routingServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.routingServiceUrl = this.configService.get<string>('ROUTING_SERVICE_URL') ?? '';
    this.httpClient = axios.create({
      baseURL: this.routingServiceUrl,
      timeout: 5000,
    });
  }

  async route(eventId: string, context: unknown): Promise<unknown> {
    if (!this.routingServiceUrl) {
      this.logger.warn(`[RoutingService] Using stub for event ${eventId}`);
      await new Promise((res) => setTimeout(res, 2000));
      return { status: 'stubbed', eventId, decision: 'DEFAULT' };
    }

    try {
      this.logger.log(`[RoutingService] Routing event ${eventId}`);
      const response = await this.httpClient.post('', { eventId, context });
      return response.data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error';
      this.logger.error(`[RoutingService] Failed to route event ${eventId}: ${message}`);
      throw err;
    }
  }
}
