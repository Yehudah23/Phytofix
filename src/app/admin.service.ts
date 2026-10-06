import { inject, Injectable } from '@angular/core';
import { AuthService, UserAccount } from './auth.service';

const ADMIN_EMAILS = new Set(['admin@phytofix.ng']);

@Injectable({ providedIn: 'root' })
export class AdminService {
	private readonly auth = inject(AuthService);

	isAdmin(user: UserAccount | null = this.auth.currentUser()): boolean {
		return !!user && ADMIN_EMAILS.has(user.email.trim().toLowerCase());
	}
}
