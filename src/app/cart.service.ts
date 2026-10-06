import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface CartItem {
	productId: string;
	name: string;
	category: string;
	price: number;
	image: string;
	quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
	private readonly auth = inject(AuthService);
	private readonly items = signal<CartItem[]>([]);

	readonly itemsList = this.items.asReadonly();
	readonly count = computed(() => this.items().reduce((total, item) => total + item.quantity, 0));
	readonly subtotal = computed(() => this.items().reduce((total, item) => total + item.price * item.quantity, 0));

	constructor() {
		effect(() => {
			const email = this.auth.currentUser()?.email ?? null;
			this.items.set(email ? this.read(email) : []);
		});
	}

	add(product: Omit<CartItem, 'quantity'>, quantity = 1): void {
		if (!this.auth.currentUser()) return;

		const items = this.items().slice();
		const index = items.findIndex((item) => item.productId === product.productId);
		if (index === -1) {
			items.push({ ...product, quantity });
		} else {
			const existing = items[index];
			items[index] = { ...existing, quantity: existing.quantity + quantity };
		}

		this.items.set(items);
		this.persist(items);
	}

	updateQuantity(productId: string, quantity: number): void {
		if (quantity <= 0) {
			this.remove(productId);
			return;
		}

		const items = this.items().map((item) => (item.productId === productId ? { ...item, quantity } : item));
		this.items.set(items);
		this.persist(items);
	}

	remove(productId: string): void {
		const items = this.items().filter((item) => item.productId !== productId);
		this.items.set(items);
		this.persist(items);
	}

	clear(): void {
		this.items.set([]);
		const email = this.auth.currentUser()?.email;
		if (email) localStorage.removeItem(this.keyFor(email));
	}

	private keyFor(email: string): string {
		return `phytofix-cart-${email}`;
	}

	private read(email: string): CartItem[] {
		try {
			return JSON.parse(localStorage.getItem(this.keyFor(email)) ?? '[]') as CartItem[];
		} catch {
			return [];
		}
	}

	private persist(items: CartItem[]): void {
		const email = this.auth.currentUser()?.email;
		if (!email) return;
		localStorage.setItem(this.keyFor(email), JSON.stringify(items));
	}
}
