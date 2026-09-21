import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

interface TrackedProduct {
  name: string;
  category: string;
  status: string;
  detail: string;
  progress: number;
  accent: string;
}

@Component({
  imports: [],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
   readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly products: TrackedProduct[] = [
    { name: 'Leaf Reset', category: 'Plant tonic', status: 'In progress', detail: 'Day 12 of 30', progress: 40, accent: 'sage' },
    { name: 'Root Restore', category: 'Soil support', status: 'Ready for review', detail: 'Day 28 of 30', progress: 93, accent: 'clay' },
    { name: 'Shield Mist', category: 'Leaf protection', status: 'Just started', detail: 'Day 3 of 14', progress: 21, accent: 'gold' },
  ];

  signOut(): void {
    this.auth.signOut();
    void this.router.navigate(['/signin']);
  }
}
