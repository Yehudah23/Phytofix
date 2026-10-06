import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AdminService } from './admin.service';

export const adminGuard: CanActivateFn = () => {
	const auth = inject(AuthService);
	const admin = inject(AdminService);
	const router = inject(Router);

	const user = auth.currentUser();
	if (!user) return router.createUrlTree(['/signin']);
	if (!admin.isAdmin(user)) return router.createUrlTree(['/dashboard']);

	return true;
};
