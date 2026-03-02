import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { HmacValidator } from './hmac.validator';

export const X_SIGNATURE_HEADER = 'x-signature';

/**
 * Guard that validates the request body against the x-signature header using HMAC.
 * Expects req.rawBody to be set by middleware (raw body buffer).
 */
@Injectable()
export class HmacGuard implements CanActivate {
  constructor(private readonly hmacValidator: HmacValidator) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { rawBody?: Buffer }>();
    const signature = request.headers[X_SIGNATURE_HEADER];
    const rawBody = request.rawBody;

    if (!rawBody) {
      throw new UnauthorizedException('Missing request body for signature verification');
    }

    const signatureStr = Array.isArray(signature) ? signature[0] : signature;
    if (!signatureStr) {
      throw new UnauthorizedException('Missing x-signature header');
    }

    const valid = this.hmacValidator.validateSignature(rawBody, signatureStr);
    if (!valid) {
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }
}
