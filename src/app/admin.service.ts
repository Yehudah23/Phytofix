import { inject, Injectable } from '@angular/core';
import { AuthService, UserAccount } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
	private readonly auth = inject(AuthService);

	isAdmin(user: UserAccount | null = this.auth.currentUser()): boolean {
		return user?.role === 'admin';
	}
}
