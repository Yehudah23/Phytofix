import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { CartService } from '../cart.service';
import { OrderService } from '../order.service';
import { formatPrice } from '../catalog';

interface PlacedOrder {
	id: string;
	eta: number;
}

@Component({
	imports: [CommonModule, RouterLink, FormsModule],
	selector: 'app-checkout',
	styleUrl: './checkout.css',
	templateUrl: './checkout.html',
})
export class Checkout {
	protected readonly cart = inject(CartService);
	private readonly orders = inject(OrderService);
	protected readonly auth = inject(AuthService);
	private readonly router = inject(Router);
	protected readonly formatPrice = formatPrice;

	name = this.auth.currentUser()?.name ?? '';
	email = this.auth.currentUser()?.email ?? '';
	phone = '';
	address = '';
	city = '';
	error = '';
	placed: PlacedOrder | null = null;

	submit(): void {
		this.error = '';

		if (this.cart.count() === 0) {
			void this.router.navigate(['/products']);
			return;
		}

		if (!this.name.trim() || !this.email.trim() || !this.phone.trim() || !this.address.trim() || !this.city.trim()) {
			this.error = 'Please complete every delivery field to place your order.';
			return;
		}

		const order = this.orders.placeOrder(
			{
				name: this.name.trim(),
				email: this.email.trim().toLowerCase(),
				phone: this.phone.trim(),
				address: this.address.trim(),
				city: this.city.trim(),
			},
			this.cart.itemsList(),
			this.cart.subtotal(),
		);

		this.cart.clear();
		this.placed = { id: order.id, eta: order.placedAt + 7 * 24 * 60 * 60 * 1000 };
	}
}
