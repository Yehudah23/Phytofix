import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { OrderService, OrderView } from '../order.service';
import { NewsService } from '../news.service';
import { RoutineService, PrescribedRoutine, RoutineStep } from '../routine.service';
import { formatPrice } from '../catalog';
import { UserProductService, TrackedProduct } from '../user-product.service';

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly orders = inject(OrderService);
  protected readonly news = inject(NewsService);
  protected readonly routines = inject(RoutineService);
  protected readonly trackedProducts = inject(UserProductService);
  careError = '';
  protected readonly formatPrice = formatPrice;

  readonly latestNews = computed(() => this.news.latest()(3));
  readonly prescribedRoutines = this.routines.prescribedForUser;

  userInitials(): string {
    const name = this.auth.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  totalPrescribedDays(): number {
    return this.prescribedRoutines().reduce((sum, routine) => sum + routine.currentDay, 0);
  }

  getProgress(routine: PrescribedRoutine): number {
    return Math.round((routine.currentDay / routine.totalDays) * 100);
  }

  getCurrentStep(routine: PrescribedRoutine): RoutineStep | undefined {
    return routine.steps
      .filter((s) => s.day <= routine.currentDay)
      .sort((a, b) => b.day - a.day)[0];
  }

  itemCount(order: OrderView): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  async advanceDay(routineId: string): Promise<void> {
    this.careError = '';
    try {
      await this.routines.advancePrescribedDay(routineId);
    } catch (error: unknown) {
      console.error('Unable to advance the prescribed care day.', error);
      this.careError = 'Your routine progress could not be updated. Please try again.';
    }
  }

  async advanceTrackedDay(product: TrackedProduct): Promise<void> {
    if (!product.id) return;
    this.careError = '';
    try {
      await this.trackedProducts.advanceDay(product.id);
    } catch (error: unknown) {
      console.error('Unable to advance the tracked product care day.', error);
      this.careError = 'Your care progress could not be updated. Please try again.';
    }
  }

  async removeTrackedProduct(product: TrackedProduct): Promise<void> {
    if (!product.id || !confirm(`Stop tracking ${product.productName}?`)) return;
    this.careError = '';
    try {
      await this.trackedProducts.removeProduct(product.id);
    } catch (error: unknown) {
      console.error('Unable to remove a tracked product.', error);
      this.careError = 'This product could not be removed from your tracker. Please try again.';
    }
  }

  signOut(): void {
    this.auth.signOut();
    void this.router.navigate(['/signin']);
  }
}
