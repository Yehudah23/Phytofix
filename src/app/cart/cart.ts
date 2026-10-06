import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../cart.service';
import { formatPrice } from '../catalog';

@Component({
	imports: [CommonModule, RouterLink],
	selector: 'app-cart',
	styleUrl: './cart.css',
	templateUrl: './cart.html',
})
export class Cart {
	protected readonly cart = inject(CartService);
	protected readonly formatPrice = formatPrice;

	increase(productId: string, quantity: number): void {
		this.cart.updateQuantity(productId, quantity + 1);
	}

	decrease(productId: string, quantity: number): void {
		this.cart.updateQuantity(productId, quantity - 1);
	}

	remove(productId: string): void {
		this.cart.remove(productId);
	}
}
