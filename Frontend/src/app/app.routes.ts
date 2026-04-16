import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth';
import { authGuard } from './guards/auth-guard';
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent , canActivate: [authGuard] }
];
