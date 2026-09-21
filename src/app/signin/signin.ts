import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule,FormsModule],
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

  submit(): void {
    this.error = '';
    if (this.auth.signIn(this.email, this.password)) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    this.error = 'Those details do not match an account. Try again or create a new account.';
  }
}
