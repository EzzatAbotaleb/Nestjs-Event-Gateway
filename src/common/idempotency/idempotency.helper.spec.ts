import { Test, TestingModule } from '@nestjs/testing';
import { IdempotencyHelper } from './idempotency.helper';

describe('IdempotencyHelper', () => {
  let helper: IdempotencyHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdempotencyHelper],
    }).compile();

    helper = module.get(IdempotencyHelper);
  });

  it('should be defined', () => {
    expect(helper).toBeDefined();
  });

  it('executeOnce runs callback', async () => {
    const mockFn = jest.fn().mockResolvedValue(undefined);

    await helper.executeOnce('test-key', mockFn);

    expect(mockFn).toHaveBeenCalled();
  });
});
