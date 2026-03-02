import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HmacValidator } from './hmac.validator';

describe('HmacValidator', () => {
  let validator: HmacValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HmacValidator,
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => 'test-secret') },
        },
      ],
    }).compile();
    validator = module.get(HmacValidator);
  });

  it('should be defined', () => expect(validator).toBeDefined());
  it('validateSignature returns false (stub)', () =>
    expect(validator.validateSignature(Buffer.from('{}'), '')).toBe(false));
  it('sign returns string (stub)', () =>
    expect(typeof validator.sign(Buffer.from('{}'))).toBe('string'));
});
