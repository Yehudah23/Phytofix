import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Product } from './catalog';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);
  readonly products = signal<Product[]>([]);

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.products.set(await this.api.request<Product[]>('GET', '/products'));
  }
}
