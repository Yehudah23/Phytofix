import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  imports: [FormsModule,CommonModule],
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

  submit(): void {
    this.error = '';
    if (this.password.length < 8) {
      this.error = 'Use at least 8 characters for your password.';
      return;
    }

    this.auth.signUp(this.name, this.email, this.password);
    void this.router.navigate(['/dashboard']);
  }
}
