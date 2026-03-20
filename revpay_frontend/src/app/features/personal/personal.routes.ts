import { Routes } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { pinGuard } from '../../core/guards/pin-guard';

export const PERSONAL_ROUTES: Routes = [
  {
    path: 'set-pin',
    loadComponent: () => import('../auth/set-pin/set-pin.component')
      .then(m => m.SetPinComponent)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [pinGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'send',
        loadComponent: () => import('./send-money/send-money.component')
          .then(m => m.SendMoneyComponent)
      },
      {
        path: 'top-up',
        loadComponent: () => import('./top-up/top-up.component')
          .then(m => m.TopUpComponent)
      },
      {
        path: 'request',
        loadComponent: () => import('./request-money/request-money.component')
          .then(m => m.RequestMoneyComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./transactions/transaction.component')
          .then(m => m.TransactionsComponent)
      },
      {
        path: 'invoices',
        loadComponent: () => import('../personal/invoices/invoice-list.component')
          .then(m => m.PersonalInvoiceListComponent)
      }
    ]
  },
];