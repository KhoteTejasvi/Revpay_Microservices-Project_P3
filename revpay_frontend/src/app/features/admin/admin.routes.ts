import { Routes } from '@angular/router';
import { AdminShellComponent } from './shell.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component')
          .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component')
          .then(m => m.AdminUsersComponent)
      },
      {
        path: 'loans',
        loadComponent: () => import('./loans/loans.component')
          .then(m => m.AdminLoansComponent)
      }
    ]
  }
];