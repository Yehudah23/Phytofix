import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Product } from './catalog';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);
  readonly products = signal<Product[]>([]);
  readonly error = signal('');

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.error.set('');
    try {
      this.products.set(await this.api.request<Product[]>('GET', '/products'));
    } catch (error: unknown) {
      console.error('Unable to load products from the Laravel API.', error);
      this.error.set('Products could not be loaded. Please try again.');
    }
  }
}
