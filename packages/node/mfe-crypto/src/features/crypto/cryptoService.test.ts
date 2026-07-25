import { describe, it, expect, vi } from 'vitest';
import { CryptoService } from './service';
import * as apiClient from '@/shared/utils/apiClient';

vi.mock('@/shared/utils/apiClient', () => ({
  request: vi.fn(),
}));

describe('CryptoService', () => {
  it('should fetch crypto symbols', async () => {
    const mockSymbols = ['BTCUSDT', 'ETHUSDT'];
    (apiClient.request as any).mockResolvedValueOnce(mockSymbols);

    const res = await CryptoService.getSymbols();
    expect(res).toEqual(mockSymbols);
    expect(apiClient.request).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/crypto/symbols'),
      { method: 'GET' },
      'fetch crypto symbols'
    );
  });

  it('should fetch crypto details', async () => {
    const mockDetails = { symbol: 'BTCUSDT', currentPrice: 65000 };
    (apiClient.request as any).mockResolvedValueOnce(mockDetails);

    const res = await CryptoService.getDetails('BTCUSDT');
    expect(res).toEqual(mockDetails);
    expect(apiClient.request).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/crypto/details?symbol=BTCUSDT'),
      { method: 'GET' },
      'fetch details for BTCUSDT'
    );
  });
});
