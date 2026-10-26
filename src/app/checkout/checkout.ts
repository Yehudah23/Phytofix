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
	whatsappUrl: string;
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
	submitting = false;

	async submit(): Promise<void> {
		this.error = '';

		if (this.cart.count() === 0) {
			void this.router.navigate(['/products']);
			return;
		}

		if (!this.name.trim() || !this.email.trim() || !this.phone.trim() || !this.address.trim() || !this.city.trim()) {
			this.error = 'Please complete every delivery field to place your order.';
			return;
		}

		this.submitting = true;
		let order: Awaited<ReturnType<OrderService['placeOrder']>>;
		try {
			const items = this.cart.itemsList();
			order = await this.orders.placeOrder(
				{
					name: this.name.trim(),
					email: this.email.trim().toLowerCase(),
					phone: this.phone.trim(),
					address: this.address.trim(),
					city: this.city.trim(),
				},
				items,
			);
			const orderLines = order.items.map((item) => `- ${item.name} x${item.quantity}: ${this.formatPrice(item.price * item.quantity)}`);
			const message = [
				'Hello Phytofix, I would like to confirm this order.',
				`Order: ${order.id}`,
				`Name: ${this.name.trim()}`,
				`Phone: ${this.phone.trim()}`,
				`Email: ${this.email.trim()}`,
				`Delivery address: ${this.address.trim()}, ${this.city.trim()}`,
				'Items:',
				...orderLines,
				`Subtotal: ${this.formatPrice(order.total)}`,
				'Please confirm availability, delivery cost, and payment instructions.',
			].join('\n');
			this.placed = {
				id: order.id,
				whatsappUrl: `https://wa.me/2348130283832?text=${encodeURIComponent(message)}`,
			};
			try {
				await this.cart.clear();
			} catch (error: unknown) {
				console.error('Order request was saved, but the server cart could not be cleared.', error);
				this.error = 'Your order request is saved, but your cart could not be cleared. Please remove the items from your cart after confirming.';
			}
		} catch (error: unknown) {
			console.error('Unable to place the order through the Laravel API.', error);
			this.error = 'Your order request could not be saved. Please check your connection and try again.';
		} finally {
			this.submitting = false;
		}
	}
}
