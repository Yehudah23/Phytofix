import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-contact',
  styleUrl: './contact.css',
  templateUrl: './contact.html',
})
export class Contact {
  name = '';
  email = '';
  subject = '';
  message = '';
  submitted = false;
  error = '';

  submit(): void {
    this.error = '';
    if (!this.name || !this.email || !this.subject || !this.message) {
      this.error = 'Please fill in all fields.';
      return;
    }
    // In a real app, you'd send this to a backend API
    console.log('Contact form submitted:', { name: this.name, email: this.email, subject: this.subject, message: this.message });
    this.submitted = true;
    this.name = this.email = this.subject = this.message = '';
  }
}