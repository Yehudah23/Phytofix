import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../contact.service';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-contact',
  styleUrl: './contact.css',
  templateUrl: './contact.html',
})
export class Contact {
  private readonly contacts = inject(ContactService);
  name = '';
  email = '';
  subject: 'routine' | 'order' | 'product' | 'account' | 'other' | '' = '';
  message = '';
  submitted = false;
  emailSent = false;
  error = '';
  saving = false;

  async submit(): Promise<void> {
    this.error = '';
    if (!this.name.trim() || !this.email.trim() || !this.subject || !this.message.trim()) {
      this.error = 'Please fill in all fields.';
      return;
    }
    this.saving = true;
    try {
      const result = await this.contacts.send({
        name: this.name.trim(),
        email: this.email.trim(),
        subject: this.subject,
        message: this.message.trim(),
      });
      this.emailSent = result.emailSent;
      this.submitted = true;
      this.name = this.email = this.message = '';
      this.subject = '';
    } catch (error: unknown) {
      console.error('Unable to submit the contact message to the Laravel API.', error);
      this.error = 'Your message could not be sent. Please check your connection and try again.';
    } finally {
      this.saving = false;
    }
  }
}