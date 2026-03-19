import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-personal-invoice-list',
  standalone: true,
  imports: [DecimalPipe, DatePipe, RouterLink, ReactiveFormsModule],
  template: `
    <div class="page">
      <a routerLink="/personal/dashboard" class="back-btn">← Back</a>

      <div class="page-header">
        <h1 class="page-title">Invoices</h1>
        <p class="page-sub">Invoices sent to you for payment</p>
      </div>

      @if (loading()) {
        <div class="empty">Loading invoices...</div>
      } @else if (!invoices().length) {
        <div class="empty">No invoices received yet</div>
      } @else {
        <div class="invoice-list">
          @for (inv of invoices(); track inv.id) {
            <div class="invoice-card"
              [class.disputed]="inv.status === 'DISPUTED'"
              [class.paid]="inv.status === 'PAID'">

              <div class="inv-top">
                <div>
                  <p class="inv-number">{{ inv.invoiceNumber }}</p>
                  <p class="inv-from">
                    From: <strong>{{ inv.issuerName }}</strong>
                    <span class="issuer-email">{{ inv.issuerEmail }}</span>
                  </p>
                </div>
                <span class="status-badge"
                  [class]="'status-' + inv.status.toLowerCase()">
                  {{ inv.status }}
                </span>
              </div>

              <div class="inv-middle">
                <div class="inv-meta">
                  <span class="meta-label">Issue Date</span>
                  <span class="meta-val">
                    {{ inv.issueDate | date:'dd MMM yyyy' }}
                  </span>
                </div>
                <div class="inv-meta">
                  <span class="meta-label">Due Date</span>
                  <span class="meta-val due">
                    {{ inv.dueDate | date:'dd MMM yyyy' }}
                  </span>
                </div>
                <div class="inv-meta">
                  <span class="meta-label">Amount Due</span>
                  <span class="meta-val amount">
                    {{ inv.currency }} {{ inv.totalAmount | number:'1.2-2' }}
                  </span>
                </div>
              </div>

              @if (inv.notes) {
                <p class="inv-notes">📝 {{ inv.notes }}</p>
              }

              <!-- Already disputed -->
              @if (inv.status === 'DISPUTED') {
                <div class="disputed-box">
                  <p>🔴 You have disputed this invoice</p>
                  @if (inv.disputeReason) {
                    <p class="dispute-reason">Reason: {{ inv.disputeReason }}</p>
                  }
                </div>
              }

              <!-- Actions for SENT invoices -->
              @if (inv.status === 'SENT') {
                <div class="inv-actions">
                  <button class="pay-btn"
                    [disabled]="actionId() === inv.id"
                    (click)="payInvoice(inv.id)">
                    {{ actionId() === inv.id ? 'Processing...' : '💳 Accept & Pay' }}
                  </button>

                  <button class="dispute-btn"
                    (click)="openDispute(inv.id)">
                    ⚠️ Dispute
                  </button>
                </div>

                <!-- Dispute form -->
                @if (disputingId() === inv.id) {
                  <div class="dispute-form">
                    <p class="dispute-form-title">Reason for dispute</p>
                    <form [formGroup]="disputeForm"
                      (ngSubmit)="submitDispute(inv.id)">
                      <textarea formControlName="reason"
                        class="dispute-textarea"
                        placeholder="e.g. Incorrect amount, service not received, duplicate invoice..."
                        rows="3">
                      </textarea>
                      @if (disputeForm.get('reason')?.invalid &&
                           disputeForm.get('reason')?.touched) {
                        <span class="field-error">
                          Please provide a reason
                        </span>
                      }
                      <div class="dispute-form-actions">
                        <button type="submit" class="submit-dispute-btn"
                          [disabled]="disputeForm.invalid || actionId() === inv.id">
                          {{ actionId() === inv.id
                            ? 'Submitting...' : 'Submit Dispute' }}
                        </button>
                        <button type="button" class="cancel-dispute-btn"
                          (click)="disputingId.set(null)">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                }
              }

              <!-- Paid -->
              @if (inv.status === 'PAID') {
                <div class="paid-badge">✅ Payment completed</div>
              }

              @if (actionError() && actionId() === inv.id) {
                <p class="action-error">⚠️ {{ actionError() }}</p>
              }

            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .page { font-family: 'Segoe UI', sans-serif; color: #e2e8f0; }

    .back-btn { color: #64748b; text-decoration: none; font-size: 0.85rem;
      display: inline-block; margin-bottom: 0.75rem; }
    .back-btn:hover { color: #94a3b8; }

    .page-header { margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
    .page-sub { color: #64748b; font-size: 0.875rem; margin-top: 0.25rem; }

    .invoice-list { display: flex; flex-direction: column; gap: 1rem; }

    .invoice-card { background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; padding: 1.5rem; transition: all 0.2s; }
    .invoice-card:hover { border-color: rgba(255,255,255,0.15); }
    .invoice-card.disputed { border-color: rgba(239,68,68,0.25);
      background: rgba(239,68,68,0.03); }
    .invoice-card.paid { border-color: rgba(34,197,94,0.2);
      background: rgba(34,197,94,0.03); }

    .inv-top { display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: 1.25rem; }
    .inv-number { color: #60a5fa; font-size: 0.9rem; font-weight: 600;
      font-family: monospace; margin-bottom: 4px; }
    .inv-from { color: #64748b; font-size: 0.82rem; }
    .inv-from strong { color: #94a3b8; }
    .issuer-email { color: #475569; font-size: 0.75rem;
      display: block; margin-top: 2px; }

    .status-badge { padding: 0.25rem 0.75rem; border-radius: 999px;
      font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
    .status-draft    { background: rgba(100,116,139,0.15); color: #94a3b8; }
    .status-sent     { background: rgba(59,130,246,0.15);  color: #60a5fa; }
    .status-paid     { background: rgba(34,197,94,0.15);   color: #4ade80; }
    .status-disputed { background: rgba(239,68,68,0.15);   color: #f87171; }
    .status-overdue  { background: rgba(239,68,68,0.15);   color: #f87171; }
    .status-cancelled{ background: rgba(100,116,139,0.1);  color: #64748b; }

    .inv-middle { display: flex; gap: 2.5rem;
      margin-bottom: 1rem; flex-wrap: wrap; }
    .meta-label { color: #475569; font-size: 0.75rem;
      display: block; margin-bottom: 3px; }
    .meta-val { color: #94a3b8; font-size: 0.875rem;
      font-weight: 500; display: block; }
    .meta-val.amount { color: #f1f5f9; font-size: 1.15rem; font-weight: 700; }
    .meta-val.due { color: #fbbf24; }

    .inv-notes { color: #64748b; font-size: 0.82rem; font-style: italic;
      margin-bottom: 1rem; padding: 0.5rem 0.75rem;
      background: rgba(255,255,255,0.03); border-radius: 8px;
      border-left: 2px solid rgba(255,255,255,0.1); }

    .inv-actions { display: flex; gap: 0.75rem;
      margin-top: 0.75rem; flex-wrap: wrap; }

    .pay-btn { padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white; border: none; border-radius: 10px;
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.2s; }
    .pay-btn:hover:not(:disabled) { opacity: 0.9; }
    .pay-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .dispute-btn { padding: 0.75rem 1.5rem;
      background: rgba(239,68,68,0.1); color: #f87171;
      border: 1px solid rgba(239,68,68,0.25); border-radius: 10px;
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s; }
    .dispute-btn:hover { background: rgba(239,68,68,0.15); }

    .dispute-form { margin-top: 1rem; padding: 1rem;
      background: rgba(239,68,68,0.05);
      border: 1px solid rgba(239,68,68,0.15);
      border-radius: 12px; }
    .dispute-form-title { color: #f87171; font-size: 0.85rem;
      font-weight: 600; margin-bottom: 0.75rem; }
    .dispute-textarea { width: 100%; padding: 0.75rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; color: #e2e8f0; font-size: 0.875rem;
      outline: none; resize: vertical; font-family: inherit; }
    .dispute-textarea:focus { border-color: #f87171; }
    .field-error { color: #f87171; font-size: 0.75rem;
      display: block; margin-top: 0.3rem; }
    .dispute-form-actions { display: flex; gap: 0.75rem; margin-top: 0.75rem; }
    .submit-dispute-btn { padding: 0.6rem 1.25rem;
      background: #ef4444; color: white; border: none;
      border-radius: 8px; font-size: 0.875rem; font-weight: 600;
      cursor: pointer; }
    .submit-dispute-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .cancel-dispute-btn { padding: 0.6rem 1.25rem;
      background: rgba(255,255,255,0.05); color: #94a3b8;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; font-size: 0.875rem; cursor: pointer; }

    .disputed-box { background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 10px; padding: 0.75rem 1rem; margin-top: 0.75rem;
      color: #f87171; font-size: 0.82rem; }
    .dispute-reason { color: #fca5a5; margin-top: 4px; font-style: italic; }

    .paid-badge { display: inline-block; color: #4ade80;
      font-size: 0.875rem; font-weight: 600; padding: 0.4rem 1rem;
      background: rgba(34,197,94,0.08); border-radius: 999px;
      margin-top: 0.75rem; border: 1px solid rgba(34,197,94,0.2); }

    .action-error { color: #f87171; font-size: 0.8rem; margin-top: 0.5rem; }

    .empty { padding: 3rem; text-align: center; color: #475569;
      background: rgba(255,255,255,0.02);
      border: 1px dashed rgba(255,255,255,0.08);
      border-radius: 16px; }
  `]
})
export class PersonalInvoiceListComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private fb = inject(FormBuilder);

  invoices = signal<any[]>([]);
  loading = signal(true);
  actionId = signal<number | null>(null);
  actionError = signal<string | null>(null);
  disputingId = signal<number | null>(null);

  disputeForm = this.fb.group({
    reason: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.dashboardService.getReceivedInvoices(0, 100).subscribe({
      next: (page) => {
        this.invoices.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  payInvoice(id: number) {
    this.actionId.set(id);
    this.actionError.set(null);
    this.dashboardService.payInvoice(id).subscribe({
      next: () => {
        this.actionId.set(null);
        this.load();
      },
      error: (err) => {
        this.actionId.set(null);
        this.actionError.set(err?.error?.message ?? 'Payment failed');
      }
    });
  }

  openDispute(id: number) {
    this.disputingId.set(id);
    this.disputeForm.reset();
  }

  submitDispute(id: number) {
    if (this.disputeForm.invalid) {
      this.disputeForm.markAllAsTouched();
      return;
    }
    this.actionId.set(id);
    this.actionError.set(null);
    const reason = this.disputeForm.value.reason!;
    this.dashboardService.disputeInvoice(id, reason).subscribe({
      next: () => {
        this.actionId.set(null);
        this.disputingId.set(null);
        this.load();
      },
      error: (err) => {
        this.actionId.set(null);
        this.actionError.set(err?.error?.message ?? 'Failed to dispute');
      }
    });
  }
}