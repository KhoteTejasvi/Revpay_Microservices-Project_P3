import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

const API = 'http://localhost:8080/api/admin';

@Component({
  selector: 'app-admin-loans',
  standalone: true,
  imports: [DecimalPipe, DatePipe, ReactiveFormsModule],
  templateUrl: `./loans.component.html`,
  styleUrls: [`./loans.component.css`]
})
export class AdminLoansComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  tabs = ['ALL', 'APPLIED', 'ACTIVE', 'REJECTED', 'CLOSED'];
  activeTab = signal('ALL');
  loans = signal<any[]>([]);
  loading = signal(true);
  pendingCount = signal(0);
  actionId = signal<number | null>(null);
  actionError = signal<string | null>(null);
  rejectingId = signal<number | null>(null);

  rejectForm = this.fb.group({
    reason: ['', Validators.required]
  });

  ngOnInit() {
    this.loadLoans('ALL');
    this.loadPendingCount();
  }

  loadPendingCount() {
    this.http.get<any>(`${API}/stats`).subscribe({
      next: (res) => this.pendingCount.set(res.data?.pendingLoans ?? 0)
    });
  }

  loadLoans(status: string) {
    this.activeTab.set(status);
    this.loading.set(true);
    this.http.get<any>(`${API}/loans?status=${status}&size=50`).subscribe({
      next: (res) => {
        this.loans.set(res.data.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  approveLoan(id: number) {
    this.actionId.set(id);
    this.actionError.set(null);
    this.http.post<any>(`${API}/loans/${id}/approve`, {}).subscribe({
      next: () => {
        this.actionId.set(null);
        this.loadLoans(this.activeTab());
        this.loadPendingCount();
      },
      error: (err) => {
        this.actionId.set(null);
        this.actionError.set(err?.error?.message ?? 'Approval failed');
      }
    });
  }

  openReject(id: number) {
    this.rejectingId.set(id);
    this.rejectForm.reset();
  }

  submitReject(id: number) {
    if (this.rejectForm.invalid) {
      this.rejectForm.markAllAsTouched();
      return;
    }
    this.actionId.set(id);
    this.http.post<any>(`${API}/loans/${id}/reject`,
      { reason: this.rejectForm.value.reason }).subscribe({
      next: () => {
        this.actionId.set(null);
        this.rejectingId.set(null);
        this.loadLoans(this.activeTab());
      },
      error: (err) => {
        this.actionId.set(null);
        this.actionError.set(err?.error?.message ?? 'Rejection failed');
      }
    });
  }

  getProgress(loan: any): number {
    if (!loan.totalRepayableAmount) return 0;
    return (loan.amountRepaid / loan.totalRepayableAmount) * 100;
  }
}