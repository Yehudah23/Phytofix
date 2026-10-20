import { effect, inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

export interface RoutineStep { day: number; title: string; description: string; instructions?: string; tips?: string; }
export interface PrescribedRoutine {
  id: string; userEmail: string; userName: string; name: string; description: string;
  totalDays: number; currentDay: number; createdBy?: string; steps: RoutineStep[];
}
export interface ProductRoutine extends PrescribedRoutine { productId: string; productName: string; productType: string; productImage: string; }

@Injectable({ providedIn: 'root' })
export class RoutineService {
  private readonly api = inject(ApiService);
  readonly prescribed = signal<PrescribedRoutine[]>([]);
  readonly prescribedForUser = this.prescribed.asReadonly();
  readonly routines = signal<ProductRoutine[]>([]);
  constructor() {
    effect(() => {
      if (localStorage.getItem('phytofix-token')) void this.load();
      else { this.prescribed.set([]); this.routines.set([]); }
    });
  }
  async load(): Promise<void> {
    const [prescribed, routines] = await Promise.all([
      this.api.request<PrescribedRoutine[]>('GET', '/prescribed'),
      this.api.request<ProductRoutine[]>('GET', '/routines'),
    ]);
    this.prescribed.set(prescribed); this.routines.set(routines);
  }
  async advancePrescribedDay(id: string): Promise<void> {
    const updated = await this.api.request<PrescribedRoutine>('POST', `/prescribed/${id}/advance`);
    this.prescribed.update((items) => items.map((item) => item.id === id ? updated : item));
  }
}
