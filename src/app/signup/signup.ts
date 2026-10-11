import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  imports: [FormsModule, CommonModule, RouterLink],
  selector: 'app-signup',
  styleUrl: '../auth.css',
  templateUrl: './signup.html',
})
export class Signup {
  public readonly auth = inject(AuthService);
  public readonly router = inject(Router);

  name = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  async submit(): Promise<void> {
    this.error = '';
    this.loading = true;
    try {
      if (this.password.length < 8) {
        this.error = 'Use at least 8 characters for your password.';
        return;
      }

      await this.auth.signUp(this.name, this.email, this.password);
      void this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      this.error = 'Failed to create account. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async signInWithGoogle(): Promise<void> {
    this.error = '';
    this.loading = true;
    try {
      await this.auth.signInWithGoogle();
      void this.router.navigate(['/dashboard']);
    } catch {
      this.error = 'Failed to sign up with Google. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
