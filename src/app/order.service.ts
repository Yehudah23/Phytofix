import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import type { CartItem } from './cart.service';

export type OrderStatus = 'placed' | 'processing' | 'in transit' | 'delivered';

export interface Order {
	id: string;
	customerEmail: string;
	customerName: string;
	placedAt: number;
	simulatedHours: number;
	items: CartItem[];
	total: number;
	address: string;
	city: string;
	phone: string;
}

export interface OrderView extends Order {
	status: OrderStatus;
	progress: number;
	eta: number;
}

const STORAGE_KEY = 'phytofix-orders';
const DELIVERY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class OrderService {
	private readonly auth = inject(AuthService);
	private readonly orders = signal<Order[]>(this.readAll());

	readonly allOrders = this.orders.asReadonly();

	readonly allViews = computed(() => this.orders().map((order) => this.toView(order)));

	readonly myViews = computed(() => {
		const email = this.auth.currentUser()?.email;
		if (!email) return [];
		return this.allViews().filter((order) => order.customerEmail === email);
	});

	placeOrder(
		details: { name: string; email: string; phone: string; address: string; city: string },
		items: CartItem[],
		total: number,
	): Order {
		const order: Order = {
			id: this.nextId(),
			customerEmail: details.email,
			customerName: details.name,
			placedAt: Date.now(),
			simulatedHours: 0,
			items: items.map((item) => ({ ...item })),
			total,
			address: details.address,
			city: details.city,
			phone: details.phone,
		};

		this.orders.update((list) => [order, ...list]);
		this.persist();
		return order;
	}

	advance(id: string): void {
		this.orders.update((list) =>
			list.map((order) => (order.id === id ? { ...order, simulatedHours: order.simulatedHours + 24 } : order)),
		);
		this.persist();
	}

	toView(order: Order): OrderView {
		const elapsed = Date.now() - order.placedAt + order.simulatedHours * 60 * 60 * 1000;
		const ratio = Math.min(1, Math.max(0, elapsed / DELIVERY_WINDOW_MS));
		const progress = Math.round(ratio * 100);
		const status: OrderStatus =
			ratio >= 1 ? 'delivered' : ratio >= 0.55 ? 'in transit' : ratio >= 0.15 ? 'processing' : 'placed';

		return { ...order, status, progress, eta: order.placedAt + DELIVERY_WINDOW_MS };
	}

	private nextId(): string {
		return `PHYTO-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
	}

	private readAll(): Order[] {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Order[];
		} catch {
			return [];
		}
	}

	private persist(): void {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders()));
	}
}
