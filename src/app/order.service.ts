import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import type { CartItem } from './cart.service';

export type OrderStatus = 'placed' | 'processing' | 'in transit' | 'delivered';
export interface Order {
  id: string; customerEmail: string; customerName: string; placedAt: number;
  simulatedHours: number; items: CartItem[]; total: number; address: string; city: string; phone: string;
  status: OrderStatus; progress: number; eta: number;
}
export type OrderView = Order;

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly orders = signal<Order[]>([]);
  readonly allOrders = this.orders.asReadonly();
  readonly allViews = this.orders.asReadonly();
  readonly myViews = computed(() => this.orders().filter((order) => order.customerEmail === this.auth.currentUser()?.email));

  constructor() {
    effect(() => {
      if (this.auth.currentUser()) void this.load();
      else this.orders.set([]);
    });
  }

  async load(admin = false): Promise<void> {
    this.orders.set(await this.api.request<Order[]>('GET', admin ? '/admin/orders' : '/orders'));
  }

  async placeOrder(details: { name: string; email: string; phone: string; address: string; city: string }, items: CartItem[]): Promise<Order> {
    const order = await this.api.request<Order>('POST', '/orders', {
      ...details,
      items: items.map(({ productId, name, category, price, image, quantity }) => ({
        product_id: productId, name, category, price, image, quantity,
      })),
    });
    this.orders.update((orders) => [order, ...orders]);
    return order;
  }

  async advance(id: string): Promise<void> {
    const order = await this.api.request<Order>('POST', `/orders/${id}/advance`);
    this.orders.update((orders) => orders.map((candidate) => candidate.id === id ? order : candidate));
  }
}
