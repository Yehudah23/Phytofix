import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';
import { Footer } from './footer/footer';
import { CartService } from './cart.service';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-root',
  imports: [Footer, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Phytofix');
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  readonly admin = inject(AdminService);
  private readonly router = inject(Router);

  signOut(): void {
    this.auth.signOut();
    void this.router.navigate(['/signin']);
  }
}
