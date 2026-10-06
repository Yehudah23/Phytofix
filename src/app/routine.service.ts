import { inject, Injectable, signal, computed } from '@angular/core';
import { AdminService } from './admin.service';
import { AuthService } from './auth.service';
import { PRODUCTS, Product } from './catalog';

export interface RoutineStep {
  day: number;
  title: string;
  description: string;
  instructions?: string;
  tips?: string;
}

export interface ProductRoutine {
  id: string;
  productId: string;
  productName: string;
  productType: string;
  productImage: string;
  name: string;
  description: string;
  totalDays: number;
  steps: RoutineStep[];
  createdBy?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface PrescribedRoutine {
  id: string;
  userEmail: string;
  userName: string;
  name: string;
  description: string;
  totalDays: number;
  currentDay: number;
  steps: RoutineStep[];
  createdBy?: string;
  createdAt?: number;
  updatedAt?: number;
}

const STORAGE_KEY = 'phytofix-product-routines';
const PRESCRIBED_KEY = 'phytofix-prescribed-routines';

@Injectable({ providedIn: 'root' })
export class RoutineService {
  private readonly admin = inject(AdminService);
  private readonly auth = inject(AuthService);
  private readonly routines = signal<ProductRoutine[]>(this.readAll());
  private readonly prescribedRoutines = signal<PrescribedRoutine[]>(this.readPrescribed());

  readonly allRoutines = this.routines.asReadonly();
  readonly allPrescribed = this.prescribedRoutines.asReadonly();

  readonly prescribedForUser = computed(() => {
    const email = this.auth.currentUser()?.email;
    if (!email) return [];
    return this.prescribedRoutines().filter((r) => r.userEmail === email);
  });

  readonly routinesByProduct = computed(() => {
    const map = new Map<string, ProductRoutine[]>();
    for (const routine of this.routines()) {
      const existing = map.get(routine.productId) || [];
      existing.push(routine);
      map.set(routine.productId, existing);
    }
    return map;
  });

  getRoutine(id: string): ProductRoutine | undefined {
    return this.routines().find((r) => r.id === id);
  }

  getRoutineForProduct(productId: string): ProductRoutine | undefined {
    return this.routines().find((r) => r.productId === productId);
  }

  addRoutine(routine: Omit<ProductRoutine, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): ProductRoutine {
    const newRoutine: ProductRoutine = {
      ...routine,
      id: `routine-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: this.admin.isAdmin() ? 'Admin' : 'User',
    };
    this.routines.update((list) => [...list, newRoutine]);
    this.persist();
    return newRoutine;
  }

  updateRoutine(id: string, updates: Partial<ProductRoutine>): boolean {
    const index = this.routines().findIndex((r) => r.id === id);
    if (index === -1) return false;

    this.routines.update((list) => {
      const newList = [...list];
      newList[index] = { ...newList[index], ...updates, updatedAt: Date.now() };
      return newList;
    });
    this.persist();
    return true;
  }

  deleteRoutine(id: string): boolean {
    const index = this.routines().findIndex((r) => r.id === id);
    if (index === -1) return false;

    this.routines.update((list) => list.filter((r) => r.id !== id));
    this.persist();
    return true;
  }

  prescribeRoutine(input: {
    userEmail: string;
    userName: string;
    name: string;
    description: string;
    totalDays: number;
    steps: RoutineStep[];
  }): PrescribedRoutine | null {
    if (!input.userEmail.trim() || !input.name.trim() || input.totalDays < 1 || input.steps.length === 0) {
      return null;
    }

    const prescribed: PrescribedRoutine = {
      id: `prescribed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userEmail: input.userEmail.trim().toLowerCase(),
      userName: input.userName.trim(),
      name: input.name.trim(),
      description: input.description.trim(),
      totalDays: Math.round(input.totalDays),
      currentDay: 1,
      steps: input.steps.map((s) => ({ ...s })).sort((a, b) => a.day - b.day),
      createdBy: this.admin.isAdmin() ? 'Admin' : 'User',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.prescribedRoutines.update((list) => [...list, prescribed]);
    this.persistPrescribed();
    return prescribed;
  }

  prescribeFromLibrary(userEmail: string, userName: string, routineId: string): PrescribedRoutine | null {
    const source = this.routines().find((r) => r.id === routineId);
    if (!source) return null;

    return this.prescribeRoutine({
      userEmail,
      userName,
      name: source.name,
      description: source.description,
      totalDays: source.totalDays,
      steps: source.steps,
    });
  }

  advancePrescribedDay(id: string): void {
    this.prescribedRoutines.update((list) =>
      list.map((r) =>
        r.id === id ? { ...r, currentDay: Math.min(r.currentDay + 1, r.totalDays), updatedAt: Date.now() } : r
      )
    );
    this.persistPrescribed();
  }

  resetPrescribedDay(id: string): void {
    this.prescribedRoutines.update((list) =>
      list.map((r) => (r.id === id ? { ...r, currentDay: 1, updatedAt: Date.now() } : r))
    );
    this.persistPrescribed();
  }

  deletePrescribed(id: string): boolean {
    const index = this.prescribedRoutines().findIndex((r) => r.id === id);
    if (index === -1) return false;

    this.prescribedRoutines.update((list) => list.filter((r) => r.id !== id));
    this.persistPrescribed();
    return true;
  }

  private readAll(): ProductRoutine[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as ProductRoutine[];
      }
      return this.createDefaultRoutines();
    } catch {
      return this.createDefaultRoutines();
    }
  }

  private createDefaultRoutines(): ProductRoutine[] {
    return [
      {
        id: 'routine-glucofix-classic',
        productId: 'glucofix-classic',
        productName: 'Glucofix Herbal Capsule',
        productType: 'Botanical supplement · Capsules',
        productImage: '/product%201.PNG',
        name: 'Glucofix 30-Day Wellness Routine',
        description: 'A structured 30-day routine for optimal results with Glucofix Herbal Capsule.',
        totalDays: 30,
        steps: [
          { day: 1, title: 'Getting Started', description: 'Take 1 capsule with breakfast. Begin tracking your daily wellness.', instructions: 'Take with food for better absorption.', tips: 'Set a daily reminder for consistency.' },
          { day: 7, title: 'Week 1 Check-in', description: 'Review how you feel after the first week. Note any changes.', instructions: 'Continue daily dose.', tips: 'Stay hydrated throughout the day.' },
          { day: 14, title: 'Week 2 Milestone', description: 'Halfway point! Evaluate your progress and adjust if needed.', instructions: 'Maintain consistent timing.', tips: 'Pair with a balanced diet.' },
          { day: 21, title: 'Week 3 Review', description: 'Three weeks in. Reflect on the routine benefits.', instructions: 'Continue as directed.', tips: 'Consider gentle exercise.' },
          { day: 30, title: 'Routine Complete', description: '30 days complete! Assess overall results and plan next steps.', instructions: 'Consult about continuing or adjusting.', tips: 'Celebrate your consistency!' },
        ],
        createdAt: Date.now() - 86400000 * 5,
        createdBy: 'Admin',
      },
      {
        id: 'routine-phytogold-tea',
        productId: 'phytogold-tea',
        productName: 'PhytoGold Tea',
        productType: 'Botanical infusion · 60 g',
        productImage: '/product%203.PNG',
        name: 'PhytoGold 14-Day Infusion Ritual',
        description: 'A gentle 14-day tea ritual for daily vitality and calm.',
        totalDays: 14,
        steps: [
          { day: 1, title: 'First Brew', description: 'Steep 1 tsp in hot water for 5 minutes. Enjoy mindfully.', instructions: 'Water temperature: 95°C.', tips: 'Create a calm morning moment.' },
          { day: 3, title: 'Finding Rhythm', description: 'Establish your preferred brewing time and strength.', instructions: 'Adjust steeping to taste.', tips: 'Try morning or evening.' },
          { day: 7, title: 'Week 1 Reflection', description: 'Notice how the ritual fits into your day.', instructions: 'Continue daily cup.', tips: 'Journal your experience.' },
          { day: 14, title: 'Ritual Established', description: 'Two weeks complete. Your tea ritual is now a habit.', instructions: 'Continue or adjust frequency.', tips: 'Share with a friend.' },
        ],
        createdAt: Date.now() - 86400000 * 3,
        createdBy: 'Admin',
      },
    ];
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.routines()));
  }

  private readPrescribed(): PrescribedRoutine[] {
    try {
      return JSON.parse(localStorage.getItem(PRESCRIBED_KEY) ?? '[]') as PrescribedRoutine[];
    } catch {
      return [];
    }
  }

  private persistPrescribed(): void {
    localStorage.setItem(PRESCRIBED_KEY, JSON.stringify(this.prescribedRoutines()));
  }
}