import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { PinModalComponent } from '../../../shared/components/pin-modal/pin-modal.component';

@Component({
  selector: 'app-business-loans',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, PinModalComponent],
  templateUrl: `./loans.component.html`,
  styleUrl: `./loans.component.css`
})
export class BusinessLoansComponent implements OnInit {
  @ViewChild('pinModal') pinModal!: PinModalComponent;

  private dashboardService = inject(DashboardService);

  loans = signal<any[]>([]);
  loading = signal(true);
  expandedLoanId = signal<number | null>(null);
  emiSchedule = signal<any[]>([]);
  loadingEmi = signal(false);
  payingEmiId = signal<number | null>(null);
  showPin = signal(false);
  pendingEmiId = signal<number | null>(null);
  pendingLoanId = signal<number | null>(null);

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
    this.pendingEmiId.set(emiId);
    this.pendingLoanId.set(loanId);
    this.showPin.set(true);
  }

  onPinConfirmed(pin: string) {
    const emiId = this.pendingEmiId();
    const loanId = this.pendingLoanId();
    if (!emiId || !loanId) return;
    this.payingEmiId.set(emiId);
    this.dashboardService.payEmi(emiId, pin).subscribe({
      next: () => {
        this.payingEmiId.set(null);
        this.showPin.set(false);
        this.pinModal.reset();
        this.load();
        this.loadingEmi.set(true);
        this.dashboardService.getEmiSchedule(loanId).subscribe({
          next: (emis: any[]) => {
            this.emiSchedule.set(emis);
            this.loadingEmi.set(false);
          }
        });
      },
      error: (err: any) => {
        this.payingEmiId.set(null);
        const msg = err?.error?.message ?? 'Payment failed';
        this.pinModal.setError(msg);
        if (!msg.toLowerCase().includes('pin')) {
          this.showPin.set(false);
        }
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