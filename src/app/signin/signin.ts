import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-signin',
  styleUrl: '../auth.css',
  templateUrl: './signin.html',
})
export class Signin {
  public readonly auth = inject(AuthService);
  public readonly router = inject(Router);

  email = '';
  password = '';
  error = '';
  loading = false;

  async submit(): Promise<void> {
    this.error = '';
    this.loading = true;
    try {
      await this.auth.signIn(this.email, this.password);
      void this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      this.error = 'Those details do not match an account. Try again or create a new account.';
    } finally {
      this.loading = false;
    }
  }

}
