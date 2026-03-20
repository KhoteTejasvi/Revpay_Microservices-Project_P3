// import { Routes } from '@angular/router';
// import { BusinessShellComponent } from './shell/shell.component';

// export const BUSINESS_ROUTES: Routes = [
//   {
//     path: '',
//     component: BusinessShellComponent,
//     children: [
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//       {
//         path: 'dashboard',
//         loadComponent: () => import('./dashboard/dashboard')
//           .then(m => m.BusinessDashboardComponent)
//       },
//       {
//         path: 'invoices',
//         loadComponent: () => import('./invoices/invoice-list.component')
//           .then(m => m.InvoiceListComponent)
//       },
//       {
//         path: 'invoices/create',
//         loadComponent: () => import('./invoices/create-invoice.component')
//           .then(m => m.CreateInvoiceComponent)
//       },
//       // {
//       //   path: 'loans',
//       //   loadComponent: () => import('./loans/loan-list.component')
//       //     .then(m => m.LoanListComponent)
//       // },
//       {
//         path: 'loans/apply',
//         loadComponent: () => import('./loans/apply-loan.component')
//           .then(m => m.ApplyLoanComponent)
//       },
//       {
//         path: 'send',
//         loadComponent: () => import('./send-money/send-money.component')
//           .then(m => m.SendMoneyComponent)
//       },
//       {
//         path: 'transactions',
//         loadComponent: () => import('./transactions/transactions.component')
//           .then(m => m.BusinessTransactionsComponent)
//       },
//       {
//         path: 'top-up',
//         loadComponent: () => import('../personal/top-up/top-up.component')
//           .then(m => m.TopUpComponent)
//       },
//       {
//         path: 'invoices',
//         loadComponent: () => import('./invoices/invoice-list.component')
//           .then(m => m.InvoiceListComponent)   // ← business component
//       },
//       {
//         path: 'invoices/create',
//         loadComponent: () => import('./invoices/create-invoice.component')
//           .then(m => m.CreateInvoiceComponent)
//       },
//       {
//         path: 'dashboard',
//         loadComponent: () => import('./dashboard/dashboard')
//           .then(m => m.BusinessDashboardComponent)  // ← check class name matches
//       },
//       {
//         path: 'loans',
//         loadComponent: () => import('./loans/loans.component')
//           .then(m => m.BusinessLoansComponent)
//       },
//     ]
//   }
// ];

import { Routes } from '@angular/router';
import { BusinessShellComponent } from './shell/shell.component';
import { pinGuard } from '../../core/guards/pin-guard';

export const BUSINESS_ROUTES: Routes = [
  {
    path: 'set-pin',
    loadComponent: () => import('../auth/set-pin/set-pin.component')
      .then(m => m.SetPinComponent)
  },
  {
    path: '',
    component: BusinessShellComponent,
    canActivate: [pinGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard')
          .then(m => m.BusinessDashboardComponent)
      },
      {
        path: 'invoices',
        loadComponent: () => import('./invoices/invoice-list.component')
          .then(m => m.InvoiceListComponent)
      },
      {
        path: 'invoices/create',
        loadComponent: () => import('./invoices/create-invoice.component')
          .then(m => m.CreateInvoiceComponent)
      },
      {
        path: 'loans',
        loadComponent: () => import('./loans/loans.component')
          .then(m => m.BusinessLoansComponent)
      },
      {
        path: 'loans/apply',
        loadComponent: () => import('./loans/apply-loan.component')
          .then(m => m.ApplyLoanComponent)
      },
      {
        path: 'send',
        loadComponent: () => import('./send-money/send-money.component')
          .then(m => m.SendMoneyComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./transactions/transactions.component')
          .then(m => m.TransactionsComponent)
      },
      {
        path: 'top-up',
        loadComponent: () => import('../business/top-up/top-up.component')
          .then(m => m.TopUpComponent)
      },
    ]
  }
];