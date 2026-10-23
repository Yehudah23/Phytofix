import { computed, inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

export interface UserAccount {
  uid: string;
  name: string;
  email: string;
  role?: 'admin' | 'user';
}

interface AuthState {
  user: UserAccount;
  token: string;
}

const USERS_COL = 'phytofix-users';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly fs = inject(Firestore);
  private readonly googleProvider = new GoogleAuthProvider();
  readonly currentUser = signal<UserAccount | null>(this.readUser());

  constructor() {
    onAuthStateChanged(this.auth, async (user: User | null) => {
      if (user) {
        const token = await user.getIdToken();
        const account = await this.resolveAccount(user, token);
        this.saveSession({ user: account, token });
      } else {
        this.clearSession();
      }
    });
  }

  async signUp(name: string, email: string, password: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    const account: UserAccount = {
      uid: credential.user.uid,
      name,
      email,
      role: 'user',
    };
    await setDoc(doc(this.fs, USERS_COL, credential.user.uid), account);
    const token = await credential.user.getIdToken();
    this.saveSession({ user: account, token });
  }

  async signIn(email: string, password: string): Promise<void> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    const account = await this.resolveAccount(credential.user, await credential.user.getIdToken());
    this.saveSession({ user: account, token: await credential.user.getIdToken() });
  }

  async signInWithGoogle(): Promise<void> {
    const credential = await signInWithPopup(this.auth, this.googleProvider);
    const account = await this.resolveAccount(credential.user, await credential.user.getIdToken());
    this.saveSession({ user: account, token: await credential.user.getIdToken() });
  }

  async signInAdmin(email: string, password: string): Promise<void> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    const account = await this.resolveAccount(credential.user, await credential.user.getIdToken());
    if (account.role !== 'admin') {
      await firebaseSignOut(this.auth);
      throw new Error('Not an admin account.');
    }
    this.saveSession({ user: account, token: await credential.user.getIdToken() });
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth);
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

  private async resolveAccount(user: User, _token: string): Promise<UserAccount> {
    const snap = await getDoc(doc(this.fs, USERS_COL, user.uid));
    if (snap.exists()) {
      const data = snap.data() as UserAccount;
      return { ...data, uid: user.uid, email: user.email ?? data.email, name: data.name ?? user.displayName ?? 'User' };
    }
    const account: UserAccount = {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      role: 'user',
    };
    await setDoc(doc(this.fs, USERS_COL, user.uid), account);
    return account;
  }

  private saveSession(state: AuthState): void {
    localStorage.setItem('phytofix-token', state.token);
    localStorage.setItem('phytofix-user', JSON.stringify(state.user));
    this.currentUser.set(state.user);
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