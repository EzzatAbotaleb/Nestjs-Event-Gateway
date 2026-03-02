import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * HMAC payload signature validator.
 * Validates payload authenticity using HMAC-SHA256 with a shared secret from env.
 * Uses constant-time comparison to avoid timing attacks.
 */
@Injectable()
export class HmacValidator {
  constructor(private readonly configService: ConfigService) {}

  private getSecret(): string {
    const secret = this.configService.get<string>('HMAC_SECRET')?.trim();
    if (!secret) {
      throw new Error('HMAC_SECRET is not configured');
    }

    return secret;
  }

  /**
   * Validate that the provided signature matches the expected HMAC of the payload.
   * @param payload - Raw request body (buffer or string)
   * @param signature - Signature from header (e.g. x-signature)
   * @returns true if valid
   */
  validateSignature(payload: Buffer | string, signature: string): boolean {
    if (!signature || typeof signature !== 'string') {
      return false;
    }
    const expected = this.sign(payload);
    if (expected.length !== signature.length) {
      return false;
    }
    try {
      return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
    } catch {
      return false;
    }
  }

  /**
   * Compute expected signature for a payload (HMAC-SHA256, hex-encoded).
   */
  sign(payload: Buffer | string): string {
    const secret = this.getSecret();
    const buf = typeof payload === 'string' ? Buffer.from(payload, 'utf8') : payload;
    return createHmac('sha256', secret).update(buf).digest('hex');
  }
}
