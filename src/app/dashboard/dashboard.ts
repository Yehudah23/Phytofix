import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { OrderService, OrderView } from '../order.service';
import { NewsService } from '../news.service';
import { RoutineService, PrescribedRoutine, RoutineStep } from '../routine.service';
import { formatPrice } from '../catalog';

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

  advanceDay(routineId: string): void {
    this.routines.advancePrescribedDay(routineId);
  }

  signOut(): void {
    this.auth.signOut();
    void this.router.navigate(['/signin']);
  }
}
