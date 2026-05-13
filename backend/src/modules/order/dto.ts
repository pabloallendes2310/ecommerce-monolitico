export interface OrderItemDto {
  itemId: string;
  quantity: number;
}

export interface CreateOrderDto {
  userId: number;
  items: OrderItemDto[];
}
