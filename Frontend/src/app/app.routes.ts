import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth';
import { TourForm } from './components/tour-form/tour-form';
import { authGuard } from './guards/auth-guard';
import { MapDisplayComponent } from './components/shared/map-display/map-display';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'dashboard', component: TourForm , canActivate: [authGuard] },
  { path: 'map', component: MapDisplayComponent },
];
