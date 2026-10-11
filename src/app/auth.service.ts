import { Injectable, signal, inject } from '@angular/core';
import { Auth, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, onAuthStateChanged } from '@angular/fire/auth';
import { UserCredential } from 'firebase/auth';

export interface UserAccount {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly googleProvider = new GoogleAuthProvider();
  readonly currentUser = signal<UserAccount | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        this.currentUser.set({
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          photoURL: user.photoURL || undefined,
        });
      } else {
        this.currentUser.set(null);
      }
    });
  }

  async signUp(name: string, email: string, password: string): Promise<UserCredential> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    // Note: In a real app, you'd update the user profile with the name
    // await updateProfile(credential.user, { displayName: name });
    return credential;
  }

  async signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signInWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(this.auth, this.googleProvider);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}
