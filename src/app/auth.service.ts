import { Injectable, signal } from '@angular/core';

export interface UserAccount {
  name: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  public readonly accountKey = 'phytofix-account';
  public readonly sessionKey = 'phytofix-session';
  readonly currentUser = signal<UserAccount | null>(this.readSession());

  signUp(name: string, email: string, password: string): boolean {
    const account = { name: name.trim(), email: email.trim().toLowerCase(), password };
    localStorage.setItem(this.accountKey, JSON.stringify(account));
    this.setSession(account);
    return true;
  }

  signIn(email: string, password: string): boolean {
    const stored = this.readAccount();
    if (!stored || stored.email !== email.trim().toLowerCase() || stored.password !== password) {
      return false;
    }

    this.setSession(stored);
    return true;
  }

  signOut(): void {
    localStorage.removeItem(this.sessionKey);
    this.currentUser.set(null);
  }

  hasAccount(): boolean {
    return this.readAccount() !== null;
  }

  public setSession(account: UserAccount): void {
    localStorage.setItem(this.sessionKey, JSON.stringify(account));
    this.currentUser.set(account);
  }

  public readAccount(): UserAccount | null {
    return this.readStorage(this.accountKey);
  }

  public readSession(): UserAccount | null {
    return this.readStorage(this.sessionKey);
  }

  public readStorage(key: string): UserAccount | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const value = localStorage.getItem(key);
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as UserAccount;
    } catch {
      return null;
    }
  }
}
