import { Global, Module } from '@nestjs/common';
import { HmacGuard } from './hmac/hmac.guard';
import { HmacValidator } from './hmac/hmac.validator';
import { IdempotencyHelper } from './idempotency/idempotency.helper';

@Global()
@Module({
  providers: [HmacValidator, HmacGuard, IdempotencyHelper],
  exports: [HmacValidator, HmacGuard, IdempotencyHelper],
})
export class CommonModule {}
