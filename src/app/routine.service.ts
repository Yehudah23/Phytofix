import { effect, inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface RoutineStep { day: number; title: string; description: string | null; instructions?: string | null; tips?: string | null; }
export interface PrescribedRoutine {
  id: string; userEmail: string; userName: string; name: string; description: string | null;
  totalDays: number; currentDay: number; createdBy?: string; steps: RoutineStep[];
}
export interface ProductRoutine extends PrescribedRoutine { productId: string | null; productName: string; productType: string; productImage: string | null; }

@Injectable({ providedIn: 'root' })
export class RoutineService {
  private readonly api = inject(ApiService);
  readonly prescribed = signal<PrescribedRoutine[]>([]);
  readonly prescribedForUser = this.prescribed.asReadonly();
  readonly routines = signal<ProductRoutine[]>([]);
  readonly adminPrescribed = signal<PrescribedRoutine[]>([]);
  constructor() {
    const auth = inject(AuthService);
    effect(() => {
      const user = auth.currentUser();
      if (user && user.role !== 'admin') void this.load();
      else {
        this.prescribed.set([]);
        this.routines.set([]);
        if (!user) this.adminPrescribed.set([]);
      }
    });
  }
  async load(): Promise<void> {
    this.prescribed.set(await this.api.request<PrescribedRoutine[]>('GET', '/prescribed'));
  }
  async loadAdminPrescribed(): Promise<void> {
    this.adminPrescribed.set(await this.api.request<PrescribedRoutine[]>('GET', '/admin/prescribed'));
  }
  async createPrescribed(input: Omit<PrescribedRoutine, 'id' | 'currentDay' | 'createdBy'>): Promise<void> {
    const created = await this.api.request<PrescribedRoutine>('POST', '/prescribed', {
      user_email: input.userEmail,
      user_name: input.userName,
      name: input.name,
      description: input.description,
      total_days: input.totalDays,
      steps: input.steps,
    });
    this.adminPrescribed.update((items) => [created, ...items]);
  }
  async advancePrescribedDay(id: string): Promise<void> {
    const updated = await this.api.request<PrescribedRoutine>('POST', `/prescribed/${id}/advance`);
    this.prescribed.update((items) => items.map((item) => item.id === id ? updated : item));
  }
}
