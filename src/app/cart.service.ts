import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface CartItem {
  id?: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly items = signal<CartItem[]>([]);
  readonly itemsList = this.items.asReadonly();
  readonly count = computed(() => this.items().reduce((total, item) => total + item.quantity, 0));
  readonly subtotal = computed(() => this.items().reduce((total, item) => total + item.price * item.quantity, 0));

  constructor() {
    effect(() => {
      if (this.auth.currentUser()) void this.load();
      else this.items.set([]);
    });
  }

  async load(): Promise<void> {
    if (!this.auth.currentUser()) return;
    this.items.set(await this.api.request<CartItem[]>('GET', '/cart'));
  }

  async add(product: Omit<CartItem, 'quantity' | 'id'>, quantity = 1): Promise<void> {
    if (!this.auth.currentUser()) return;
    await this.api.request('POST', '/cart', { product_id: product.productId, ...product, quantity });
    await this.load();
  }

  async updateQuantity(productId: string, quantity: number): Promise<void> {
    const item = this.items().find((candidate) => candidate.productId === productId);
    if (!item?.id) return;
    if (quantity <= 0) return this.remove(productId);
    await this.api.request('PUT', `/cart/${item.id}`, { quantity });
    await this.load();
  }

  async remove(productId: string): Promise<void> {
    const item = this.items().find((candidate) => candidate.productId === productId);
    if (item?.id) await this.api.request('DELETE', `/cart/${item.id}`);
    await this.load();
  }

  async clear(): Promise<void> {
    await this.api.request('DELETE', '/cart');
    this.items.set([]);
  }
}
