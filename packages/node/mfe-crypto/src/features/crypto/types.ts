export interface CryptoSymbol {
  symbol: string;
  name?: string;
}

export interface CryptoPriceData {
  symbol: string;
  price: number;
}

export interface CryptoAvgPriceData {
  symbol: string;
  mins: number;
  price: number;
}

export interface CryptoBookTicker {
  symbol: string;
  bidPrice: number;
  bidQty: number;
  askPrice: number;
  askQty: number;
}

export interface OrderbookEntry {
  price: number;
  quantity: number;
}

export interface CryptoOrderbook {
  symbol: string;
  bids: OrderbookEntry[];
  asks: OrderbookEntry[];
}

export interface CryptoTrade {
  tradeId: number;
  price: number;
  qty: number;
  time: number;
  isBuyerMaker: boolean;
}

export interface CryptoTradesData {
  symbol: string;
  trades: CryptoTrade[];
}

export interface CryptoMoverItem {
  symbol: string;
  priceChangePercent: number;
  lastPrice: number;
  volume: number;
}

export interface CryptoMoversData {
  topGainers: CryptoMoverItem[];
  topLosers: CryptoMoverItem[];
}

export interface CryptoDetailsData {
  symbol: string;
  name: string;
  type: string;
  currentPrice: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

export interface KlineItem {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export interface CryptoKlinesData {
  symbol: string;
  interval: string;
  klines: KlineItem[];
}
