import { Module } from '@nestjs/common';
import { RoutingService } from './routing.service';
import { RoutingStubController } from './routing-stub.controller';

@Module({
  providers: [RoutingService],
  controllers: [RoutingStubController],
  exports: [RoutingService],
})
export class RoutingModule {}
