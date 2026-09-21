import { Routes } from '@angular/router';
import { Hero } from './hero/hero';
import { About } from './about/about';
import { Products } from './products/products';
import { Team } from './team/team';
import { authGuard } from './auth.guard';
import { Signin } from './signin/signin';
import { Signup } from './signup/signup';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  {path: '', component: Hero},
  {path: 'home', component: Hero},
  {path: 'hero', component: Hero},
  {path: 'about', component:About},
  {path: 'products', component:Products},
  {path: 'team', component:Team},
  {path: 'signin', component:Signin},
  {path: 'signup', component:Signup},
  {path: 'dashboard', component:Dashboard, canActivate: [authGuard]}

];
