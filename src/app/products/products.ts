import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../catalog';
import { ProductService } from '../product.service';
import { AuthService } from '../auth.service';
import { CartService } from '../cart.service';

@Component({
  imports: [CommonModule],
  selector: 'app-products',
  styleUrl: './products.css',
  templateUrl: './products.html',
})
export class Products {
  protected readonly productService = inject(ProductService);
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);

  protected addedId = '';
  protected quantities: Record<string, number> = {};

  quantityOf(product: Product): number {
    return this.quantities[product.id] ?? 1;
  }

  changeQuantity(product: Product, delta: number): void {
    const next = Math.max(1, this.quantityOf(product) + delta);
    this.quantities = { ...this.quantities, [product.id]: next };
  }

  async addToCart(product: Product): Promise<void> {
    if (!this.auth.currentUser()) {
      void this.router.navigate(['/signin']);
      return;
    }

    await this.cart.add(
      {
        productId: product.id,
        name: product.name,
        category: product.type,
        price: product.price,
        image: product.image,
      },
      this.quantityOf(product),
    );

    this.addedId = product.id;
    setTimeout(() => {
      if (this.addedId === product.id) this.addedId = '';
    }, 1600);
  }
}
