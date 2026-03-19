import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { MoneyRequestResponse } from '../../../core/models/dashboard.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-money',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <a routerLink="/personal/dashboard" class="back-btn">← Back</a>
        <h1 class="page-title">Request Money</h1>
        <p class="page-sub">Request funds from another RevPay user</p>
      </div>

      <div class="two-col-layout">

        <!-- Send Request Form -->
        <div class="card">
          <h3 class="card-title">New Request</h3>

          @if (success()) {
            <div class="success-banner">✅ Request sent successfully!</div>
          }
          @if (error()) {
            <div class="error-banner">⚠️ {{ error() }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="field">
              <label>Recipient Email</label>
              <input formControlName="payerIdentifier" type="email"
                placeholder="user@example.com"/>
              @if (form.get('payerIdentifier')?.invalid &&
                   form.get('payerIdentifier')?.touched) {
                <span class="field-error">Valid email required</span>
              }
            </div>
            <div class="field">
              <label>Amount</label>
              <div class="amount-wrap">
                <span class="currency-tag">USD</span>
                <input formControlName="amount" type="number"
                  placeholder="0.00" step="0.01"/>
              </div>
            </div>
            <div class="field">
              <label>Message <span class="optional">(optional)</span></label>
              <input formControlName="message" type="text"
                placeholder="Dinner split, rent..."/>
            </div>
            <button type="submit" class="submit-btn"
              [disabled]="form.invalid || loading()">
              {{ loading() ? 'Sending...' : 'Send Request' }}
            </button>
          </form>
        </div>

        <!-- Pending Received Requests -->
        <div>
          <div class="section-title">Received Requests</div>
          <div class="requests-list">
            @if (!receivedRequests().length) {
              <div class="empty-state">No pending requests</div>
            }
            @for (req of receivedRequests(); track req.id) {
              <div class="request-card">
                <div class="req-top">
                  <div>
                    <p class="req-name">{{ req.requesterName }}</p>
                    <p class="req-email">{{ req.requesterEmail }}</p>
                  </div>
                  <p class="req-amount">
                    USD {{ req.amount | number:'1.2-2' }}
                  </p>
                </div>
                @if (req.message) {
                  <p class="req-msg">"{{ req.message }}"</p>
                }
                <div class="req-actions">
                  <button class="accept-btn"
                    (click)="accept(req.id)"
                    [disabled]="actionLoading() === req.id">
                    {{ actionLoading() === req.id ? '...' : 'Accept' }}
                  </button>
                  <button class="reject-btn"
                    (click)="reject(req.id)"
                    [disabled]="actionLoading() === req.id">
                    Decline
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .page { font-family: 'Segoe UI', sans-serif; color: #e2e8f0; }

    .page-header { margin-bottom: 1.5rem; }
    .back-btn { color: #64748b; text-decoration: none; font-size: 0.85rem;
      display: inline-block; margin-bottom: 0.75rem; }
    .back-btn:hover { color: #94a3b8; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
    .page-sub { color: #64748b; font-size: 0.875rem; margin-top: 0.25rem; }

    .two-col-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px; padding: 1.5rem; }
    .card-title { color: #f1f5f9; font-size: 1rem; font-weight: 600; margin-bottom: 1.25rem; }

    .success-banner { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25);
      border-radius: 10px; padding: 0.875rem; color: #4ade80; font-size: 0.85rem; margin-bottom: 1.25rem; }
    .error-banner { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
      border-radius: 10px; padding: 0.875rem; color: #f87171; font-size: 0.85rem; margin-bottom: 1.25rem; }

    .field { margin-bottom: 1rem; }
    .field label { display: block; color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.4rem; }
    .optional { color: #475569; }
    .field input { width: 100%; padding: 0.75rem 1rem; background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;
      font-size: 0.9rem; outline: none; }
    .field input:focus { border-color: #3b82f6; }
    .field input::placeholder { color: #334155; }
    .field-error { color: #f87171; font-size: 0.75rem; margin-top: 0.3rem; display: block; }

    .amount-wrap { display: flex; align-items: center; background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; }
    .amount-wrap:focus-within { border-color: #3b82f6; }
    .currency-tag { padding: 0 0.875rem; color: #64748b; font-size: 0.85rem;
      border-right: 1px solid rgba(255,255,255,0.08); }
    .amount-wrap input { border: none; background: transparent; padding: 0.75rem;
      color: #fff; font-size: 0.9rem; outline: none; width: 100%; }

    .submit-btn { width: 100%; padding: 0.875rem; background: linear-gradient(135deg,#3b82f6,#1d4ed8);
      color: white; border: none; border-radius: 10px; font-size: 0.95rem; font-weight: 600;
      cursor: pointer; margin-top: 0.5rem; transition: opacity 0.2s; }
    .submit-btn:hover:not(:disabled) { opacity: 0.9; }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .section-title { color: #94a3b8; font-size: 0.8rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 1rem; }

    .requests-list { display: flex; flex-direction: column; gap: 0.75rem; }

    .request-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px; padding: 1.25rem; }
    .req-top { display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 0.75rem; }
    .req-name { color: #f1f5f9; font-size: 0.9rem; font-weight: 500; }
    .req-email { color: #64748b; font-size: 0.78rem; margin-top: 2px; }
    .req-amount { color: #fbbf24; font-size: 1rem; font-weight: 700; }
    .req-msg { color: #64748b; font-size: 0.82rem; font-style: italic; margin-bottom: 0.75rem; }

    .req-actions { display: flex; gap: 0.5rem; }
    .accept-btn { flex: 1; padding: 0.5rem; background: rgba(34,197,94,0.1);
      color: #4ade80; border: 1px solid rgba(34,197,94,0.25); border-radius: 8px;
      cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s; }
    .accept-btn:hover:not(:disabled) { background: rgba(34,197,94,0.2); }
    .reject-btn { flex: 1; padding: 0.5rem; background: rgba(239,68,68,0.1);
      color: #f87171; border: 1px solid rgba(239,68,68,0.2); border-radius: 8px;
      cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s; }
    .reject-btn:hover:not(:disabled) { background: rgba(239,68,68,0.2); }
    .accept-btn:disabled, .reject-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .empty-state { background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.08);
      border-radius: 14px; padding: 2rem; text-align: center; color: #475569; font-size: 0.9rem; }
  `]
})
export class RequestMoneyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dashboardService = inject(DashboardService);

  receivedRequests = signal<MoneyRequestResponse[]>([]);
  loading = signal(false);
  actionLoading = signal<number | null>(null);
  error = signal<string | null>(null);
  success = signal(false);

  form = this.fb.group({
    payerIdentifier: ['', [Validators.required, Validators.email]],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    message: ['']
  });

  ngOnInit() {
    this.loadReceived();
  }

  loadReceived() {
    this.dashboardService.getReceivedRequests(0, 20).subscribe({
      next: (page) => this.receivedRequests.set(
        page.content.filter(r => r.status === 'PENDING')
      )
    });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    const { payerIdentifier, amount, message } = this.form.value;
    this.dashboardService.sendMoneyRequest({
      payerIdentifier: payerIdentifier!,
      amount: amount!,
      message: message ?? undefined
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.form.reset();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Request failed');
      }
    });
  }

  accept(id: number) {
    this.actionLoading.set(id);
    this.dashboardService.acceptRequest(id).subscribe({
      next: () => { this.actionLoading.set(null); this.loadReceived(); },
      error: () => this.actionLoading.set(null)
    });
  }

  reject(id: number) {
    this.actionLoading.set(id);
    this.dashboardService.rejectRequest(id).subscribe({
      next: () => { this.actionLoading.set(null); this.loadReceived(); },
      error: () => this.actionLoading.set(null)
    });
  }
}