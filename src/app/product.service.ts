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

  async add(product: Omit<Product, 'id'>, imageFile?: File): Promise<Product> {
    const body = this.productBody(product, imageFile);
    const created = await this.api.request<Product>('POST', '/products', body);
    this.products.update((products) => [created, ...products]);
    return created;
  }

  async update(id: string, product: Omit<Product, 'id'>, imageFile?: File): Promise<Product> {
    const { image, ...fields } = product;
    const body = imageFile ? this.productFormData(product, imageFile, true) : image ? product : fields;
    const method = imageFile ? 'POST' : 'PUT';
    const updated = await this.api.request<Product>(method, `/products/${id}`, body);
    this.products.update((products) => products.map((candidate) => candidate.id === id ? updated : candidate));
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.api.request('DELETE', `/products/${id}`);
    this.products.update((products) => products.filter((product) => product.id !== id));
  }

  private productBody(product: Omit<Product, 'id'>, imageFile?: File): FormData | Omit<Product, 'id'> {
    return imageFile ? this.productFormData(product, imageFile) : product;
  }

  private productFormData(product: Omit<Product, 'id'>, imageFile: File, override = false): FormData {
    const body = new FormData();
    for (const [key, value] of Object.entries(product)) {
      if (value !== undefined && value !== null) {
        body.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
      }
    }
    body.append('image_file', imageFile);
    if (override) body.append('_method', 'PUT');
    return body;
  }
}
