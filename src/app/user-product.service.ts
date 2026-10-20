import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface TrackedProduct {
  id?: string; userEmail: string; productId: string; productName: string; productType: string;
  productImage: string; startedAt: number; currentDay: number; totalDays: number; routineId?: string;
}

@Injectable({ providedIn: 'root' })
export class UserProductService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly trackedProducts = signal<TrackedProduct[]>([]);
  readonly myTrackedProducts = computed(() => this.trackedProducts());
  constructor() {
    effect(() => {
      if (this.auth.currentUser()) void this.load();
      else this.trackedProducts.set([]);
    });
  }
  async load(): Promise<void> { this.trackedProducts.set(await this.api.request<TrackedProduct[]>('GET', '/user-products')); }
  async addProduct(productId: string, totalDays = 30, routineId?: string, product?: { name: string; type: string; image?: string }): Promise<TrackedProduct> {
    const item = await this.api.request<TrackedProduct>('POST', '/user-products', {
      product_id: productId, product_name: product?.name ?? '', product_type: product?.type ?? '',
      product_image: product?.image, total_days: totalDays, routine_id: routineId,
    });
    this.trackedProducts.update((items) => [...items, item]); return item;
  }
  async removeProduct(id: string): Promise<void> { await this.api.request('DELETE', `/user-products/${id}`); this.trackedProducts.update((items) => items.filter((item) => item.id !== id)); }
  async advanceDay(id: string): Promise<void> {
    const updated = await this.api.request<TrackedProduct>('POST', `/user-products/${id}/advance`);
    this.trackedProducts.update((items) => items.map((item) => item.id === id ? updated : item));
  }
}
