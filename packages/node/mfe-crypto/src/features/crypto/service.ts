import { API_ENDPOINTS } from '@/config/api-endpoints';
import { AppConfig } from '@/config/app-config';
import { request } from '@/shared/utils/apiClient';
import {
  CryptoPriceData,
  CryptoAvgPriceData,
  CryptoBookTicker,
  CryptoOrderbook,
  CryptoTradesData,
  CryptoMoversData,
  CryptoDetailsData,
  CryptoKlinesData,
} from './types';

export class CryptoService {
  private static getUrl(path: string): string {
    return `${AppConfig.apiUrl}${path}`;
  }

  public static async getSymbols(): Promise<string[]> {
    return request<string[]>(
      this.getUrl(API_ENDPOINTS.crypto.symbols),
      { method: 'GET' },
      'fetch crypto symbols'
    );
  }

  public static async getPrice(symbol: string): Promise<CryptoPriceData> {
    return request<CryptoPriceData>(
      this.getUrl(API_ENDPOINTS.crypto.price(symbol)),
      { method: 'GET' },
      `fetch price for ${symbol}`
    );
  }

  public static async getAvgPrice(symbol: string): Promise<CryptoAvgPriceData> {
    return request<CryptoAvgPriceData>(
      this.getUrl(API_ENDPOINTS.crypto.avgPrice(symbol)),
      { method: 'GET' },
      `fetch average price for ${symbol}`
    );
  }

  public static async getBookTicker(symbol: string): Promise<CryptoBookTicker> {
    return request<CryptoBookTicker>(
      this.getUrl(API_ENDPOINTS.crypto.bookTicker(symbol)),
      { method: 'GET' },
      `fetch book ticker for ${symbol}`
    );
  }

  public static async getOrderbook(symbol: string, limit = 5): Promise<CryptoOrderbook> {
    return request<CryptoOrderbook>(
      this.getUrl(API_ENDPOINTS.crypto.orderbook(symbol, limit)),
      { method: 'GET' },
      `fetch orderbook for ${symbol}`
    );
  }

  public static async getTrades(symbol: string, limit = 5): Promise<CryptoTradesData> {
    return request<CryptoTradesData>(
      this.getUrl(API_ENDPOINTS.crypto.trades(symbol, limit)),
      { method: 'GET' },
      `fetch trades for ${symbol}`
    );
  }

  public static async getMovers(): Promise<CryptoMoversData> {
    return request<CryptoMoversData>(
      this.getUrl(API_ENDPOINTS.crypto.movers),
      { method: 'GET' },
      'fetch market movers'
    );
  }

  public static async getDetails(symbol: string): Promise<CryptoDetailsData> {
    return request<CryptoDetailsData>(
      this.getUrl(API_ENDPOINTS.crypto.details(symbol)),
      { method: 'GET' },
      `fetch details for ${symbol}`
    );
  }

  public static async getKlines(symbol: string, interval = '1d', limit = 5): Promise<CryptoKlinesData> {
    return request<CryptoKlinesData>(
      this.getUrl(API_ENDPOINTS.crypto.klines(symbol, interval, limit)),
      { method: 'GET' },
      `fetch klines for ${symbol}`
    );
  }
}
