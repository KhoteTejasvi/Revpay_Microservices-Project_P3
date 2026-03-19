import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
  path: 'forgot-password',
  loadComponent: () => import('../../core/services/forgotPassword/forgot-password.component')
    .then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('../../core/services/forgotPassword/reset-password.component')
      .then(m => m.ResetPasswordComponent)
  },
];