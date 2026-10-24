import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';

export interface UserAccount {
  name: string;
  email: string;
  role?: 'admin' | 'user';
}

interface AuthResponse {
  user: UserAccount;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  readonly currentUser = signal<UserAccount | null>(this.readUser());

  async signUp(name: string, email: string, password: string): Promise<void> {
    const response = await this.api.request<AuthResponse>('POST', '/register', { name, email, password });
    this.saveSession(response);
  }

  async signIn(email: string, password: string): Promise<void> {
    const response = await this.api.request<AuthResponse>('POST', '/login', { email, password });
    this.saveSession(response);
  }

  async signInAdmin(email: string, password: string): Promise<void> {
    const response = await this.api.request<AuthResponse>('POST', '/admin-login', { email, password });
    this.saveSession(response);
  }

  async signOut(): Promise<void> {
    try {
      if (localStorage.getItem('phytofix-token')) await this.api.request('POST', '/logout');
    } finally {
      this.clearSession();
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('phytofix-token') && this.currentUser() !== null;
  }

  get token(): string | null {
    return localStorage.getItem('phytofix-token');
  }

  private saveSession(response: AuthResponse): void {
    localStorage.setItem('phytofix-token', response.token);
    localStorage.setItem('phytofix-user', JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  private clearSession(): void {
    localStorage.removeItem('phytofix-token');
    localStorage.removeItem('phytofix-user');
    this.currentUser.set(null);
  }

  private readUser(): UserAccount | null {
    try {
      return JSON.parse(localStorage.getItem('phytofix-user') ?? 'null') as UserAccount | null;
    } catch {
      return null;
    }
  }
}
