import { Routes } from '@angular/router';
import { Hero } from './hero/hero';
import { About } from './about/about';
import { Products } from './products/products';
import { Team } from './team/team';
import { Contact } from './contact/contact';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';
import { Signin } from './signin/signin';
import { Signup } from './signup/signup';
import { Dashboard } from './dashboard/dashboard';
import { Cart } from './cart/cart';
import { Checkout } from './checkout/checkout';
import { Admin } from './admin/admin';
import { AdminLogin } from './admin-login/admin-login';

export const routes: Routes = [
	{ path: '', component: Hero },
	{ path: 'home', component: Hero },
	{ path: 'hero', component: Hero },
	{ path: 'about', component: About },
	{ path: 'products', component: Products },
	{ path: 'team', component: Team },
	{ path: 'contact', component: Contact },
	{ path: 'signin', component: Signin },
	{ path: 'signup', component: Signup },
	{ path: 'admin-login', component: AdminLogin },
	{ path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
	{ path: 'cart', component: Cart, canActivate: [authGuard] },
	{ path: 'checkout', component: Checkout, canActivate: [authGuard] },
	{ path: 'admin', component: Admin, canActivate: [adminGuard] },
];
