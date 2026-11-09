import { HttpErrorResponse } from '@angular/common/http';
import { FirebaseError, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ApiService } from './api.service';

interface AuthResponse {
  user: {
    name: string;
    email: string;
    role?: 'admin' | 'user';
  };
  token: string;
}

export async function authenticateWithGoogle(
  api: ApiService,
  config: FirebaseOptions,
): Promise<AuthResponse> {
  const app = getApps().find((candidate) => candidate.name === '[DEFAULT]')
    ?? initializeApp(config);

  try {
    const credential = await signInWithPopup(getAuth(app), new GoogleAuthProvider());
    const idToken = await credential.user.getIdToken();
    return await api.request<AuthResponse>('POST', '/auth/google', { id_token: idToken });
  } catch (error: unknown) {
    if (error instanceof FirebaseError && error.code === 'auth/unauthorized-domain') {
      throw new Error('This website domain is not authorized for Google sign-in in Firebase Authentication.');
    }

    if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
      throw new Error(error.error.message);
    }

    throw error;
  }
}
