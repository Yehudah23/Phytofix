import { Injectable, signal } from '@angular/core';
import { PRODUCTS, Product } from './catalog';

@Injectable({ providedIn: 'root' })
export class ProductService {
  readonly products = signal<Product[]>(PRODUCTS);
}
