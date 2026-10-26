import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { formatPrice, Product } from '../catalog';
import { ProductService } from '../product.service';
import { AuthService } from '../auth.service';
import { CartService } from '../cart.service';
import { UserProductService } from '../user-product.service';

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-products',
  styleUrl: './products.css',
  templateUrl: './products.html',
})
export class Products {
  protected readonly productService = inject(ProductService);
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly trackedProducts = inject(UserProductService);

  protected addedId = '';
  protected trackingId = '';
  protected trackingError = '';
  protected showAuthChoice = false;
  protected quantities: Record<string, number> = {};
  protected readonly formatPrice = formatPrice;

  quantityOf(product: Product): number {
    return this.quantities[product.id] ?? 1;
  }

  changeQuantity(product: Product, delta: number): void {
    const next = Math.max(1, this.quantityOf(product) + delta);
    this.quantities = { ...this.quantities, [product.id]: next };
  }

  async addToCart(product: Product): Promise<void> {
    if (!this.auth.currentUser()) {
      this.showAuthChoice = true;
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

  async startTracking(product: Product): Promise<void> {
    if (!this.auth.currentUser()) {
      this.showAuthChoice = true;
      return;
    }
    this.trackingError = '';
    try {
      await this.trackedProducts.addProduct(product.id, 30, undefined, {
        name: product.name,
        type: product.type,
        image: product.image,
      });
      this.trackingId = product.id;
      setTimeout(() => {
        if (this.trackingId === product.id) this.trackingId = '';
      }, 2000);
    } catch (error: unknown) {
      console.error('Unable to add the product to the customer care tracker.', error);
      this.trackingError = 'This product could not be added to your care tracker. Please try again.';
    }
  }
}
