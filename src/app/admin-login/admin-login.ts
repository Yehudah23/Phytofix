import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { AdminService } from '../admin.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-admin-login',
  styleUrl: '../auth.css',
  templateUrl: './admin-login.html',
})
export class AdminLogin {
  public readonly auth = inject(AuthService);
  private readonly admin = inject(AdminService);
  public readonly router = inject(Router);

  email = '';
  password = '';
  error = '';
  loading = false;

  async submit(): Promise<void> {
    this.error = '';
    this.loading = true;
    try {
      if (!this.admin.isAdmin({ uid: '', name: '', email: this.email, photoURL: '' })) {
        this.error = 'Admin access only. Use the admin email.';
        return;
      }
      await this.auth.signIn(this.email, this.password);
      void this.router.navigate(['/admin']);
    } catch {
      this.error = 'Invalid admin credentials. Try again.';
    } finally {
      this.loading = false;
    }
  }
}