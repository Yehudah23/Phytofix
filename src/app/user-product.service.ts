import { inject, Injectable, signal, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { PRODUCTS, Product } from './catalog';

export interface TrackedProduct {
  userEmail: string;
  productId: string;
  productName: string;
  productType: string;
  productImage: string;
  startedAt: number;
  currentDay: number;
  totalDays: number;
  routineId?: string;
}

const STORAGE_KEY = 'phytofix-user-products';

@Injectable({ providedIn: 'root' })
export class UserProductService {
  private readonly auth = inject(AuthService);
  private readonly trackedProducts = signal<TrackedProduct[]>(this.readAll());

  readonly myTrackedProducts = computed(() => {
    const email = this.auth.currentUser()?.email;
    if (!email) return [];
    return this.trackedProducts().filter((p) => p.userEmail === email);
  });

  addProduct(productId: string, totalDays: number = 30, routineId?: string): TrackedProduct | null {
    const user = this.auth.currentUser();
    if (!user) return null;

    const catalogProduct = PRODUCTS.find((p) => p.id === productId);
    if (!catalogProduct) return null;

    const existing = this.trackedProducts().find(
      (p) => p.userEmail === user.email && p.productId === productId
    );
    if (existing) return existing;

    const tracked: TrackedProduct = {
      userEmail: user.email,
      productId: catalogProduct.id,
      productName: catalogProduct.name,
      productType: catalogProduct.type,
      productImage: catalogProduct.image,
      startedAt: Date.now(),
      currentDay: 1,
      totalDays,
      routineId,
    };

    this.trackedProducts.update((list) => [...list, tracked]);
    this.persist();
    return tracked;
  }

  removeProduct(productId: string): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.trackedProducts.update((list) =>
      list.filter((p) => !(p.userEmail === user.email && p.productId === productId))
    );
    this.persist();
  }

  updateProgress(productId: string, currentDay: number): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.trackedProducts.update((list) =>
      list.map((p) =>
        p.userEmail === user.email && p.productId === productId
          ? { ...p, currentDay: Math.min(currentDay, p.totalDays) }
          : p
      )
    );
    this.persist();
  }

  advanceDay(productId: string): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.trackedProducts.update((list) =>
      list.map((p) => {
        if (p.userEmail !== user.email || p.productId !== productId) return p;
        const nextDay = Math.min(p.currentDay + 1, p.totalDays);
        return { ...p, currentDay: nextDay };
      })
    );
    this.persist();
  }

  private readAll(): TrackedProduct[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as TrackedProduct[];
    } catch {
      return [];
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.trackedProducts()));
  }
}