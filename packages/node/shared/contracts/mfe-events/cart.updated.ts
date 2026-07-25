export interface CartUpdatedEvent {
  cartId: string;
  itemCount: number;
  totalPrice: number;
  timestamp: string;
}
