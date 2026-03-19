import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-business-loans',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: `./loans.component.html`,
  styleUrl: `./loans.component.css`
})
export class BusinessLoansComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  loans = signal<any[]>([]);
  loading = signal(true);
  expandedLoanId = signal<number | null>(null);
  emiSchedule = signal<any[]>([]);
  loadingEmi = signal(false);
  payingEmiId = signal<number | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.dashboardService.getMyLoans(0, 50).subscribe({
      next: (page) => {
        this.loans.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleSchedule(loanId: number) {
    if (this.expandedLoanId() === loanId) {
      this.expandedLoanId.set(null);
      return;
    }
    this.expandedLoanId.set(loanId);
    this.loadingEmi.set(true);
    this.dashboardService.getEmiSchedule(loanId).subscribe({
      next: (emis) => {
        this.emiSchedule.set(emis);
        this.loadingEmi.set(false);
      },
      error: () => this.loadingEmi.set(false)
    });
  }

  payEmi(emiId: number, loanId: number) {
    this.payingEmiId.set(emiId);
    this.dashboardService.payEmi(emiId).subscribe({
      next: () => {
        this.payingEmiId.set(null);
        this.load();
        // Reload EMI schedule
        this.loadingEmi.set(true);
        this.dashboardService.getEmiSchedule(loanId).subscribe({
          next: (emis: any[]) => {
            this.emiSchedule.set(emis);
            this.loadingEmi.set(false);
          }
        });
      },
      error: (err: { error: { message: any; }; }) => {
        this.payingEmiId.set(null);
        alert(err?.error?.message ?? 'Payment failed');
      }
    });
  }

  toggleAutoDebit(loan: any) {
    this.dashboardService.toggleAutoDebit(loan.id).subscribe({
      next: () => {
        loan.autoDebit = !loan.autoDebit;
      }
    });
  }

  getProgress(loan: any): number {
    if (!loan.totalRepayableAmount) return 0;
    return (Number(loan.amountRepaid) / Number(loan.totalRepayableAmount)) * 100;
  }
}