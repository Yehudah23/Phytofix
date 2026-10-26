import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

export type ContactSubject = 'routine' | 'order' | 'product' | 'account' | 'other';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: ContactSubject;
  message: string;
  isRead: boolean;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly api = inject(ApiService);

  send(message: Omit<ContactMessage, 'id' | 'isRead' | 'createdAt'>): Promise<{ message: string; emailSent: boolean }> {
    return this.api.request('POST', '/contact', message);
  }

  list(): Promise<ContactMessage[]> {
    return this.api.request('GET', '/admin/contact-messages');
  }

  markRead(id: string): Promise<void> {
    return this.api.request('PATCH', `/admin/contact-messages/${id}/read`);
  }

  remove(id: string): Promise<void> {
    return this.api.request('DELETE', `/admin/contact-messages/${id}`);
  }
}
