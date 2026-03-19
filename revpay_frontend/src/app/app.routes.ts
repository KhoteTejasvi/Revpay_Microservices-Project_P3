import { Routes } from '@angular/router';
import { authGuard } from '../app/core/guards/auth-guard';
import { roleGuard } from '../app/core/guards/role-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'personal',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PERSONAL', 'ADMIN'] },
    loadChildren: () =>
      import('./features/personal/personal.routes').then(m => m.PERSONAL_ROUTES)
  },
  {
    path: 'business',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BUSINESS', 'ADMIN'] },
    loadChildren: () =>
      import('./features/business/business.routes').then(m => m.BUSINESS_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/components/unauthorized/unauthorized')
        .then(m => m.Unauthorized)
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found')
        .then(m => m.NotFound)
  }
];