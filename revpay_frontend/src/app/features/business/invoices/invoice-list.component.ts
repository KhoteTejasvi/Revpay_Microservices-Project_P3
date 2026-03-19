import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
      <a routerLink="/business/dashboard" class="back-btn">← Back</a>
      <h1 class="page-title">Send Money</h1>
      <p class="page-sub">Transfer funds to another RevPay user</p>
    </div>
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Invoices</h1>
          <p class="page-sub">Manage your business invoices</p>
        </div>
        <a routerLink="/business/invoices/create" class="new-btn">+ New Invoice</a>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        @for (tab of tabs; track tab) {
          <button class="tab-btn"
            [class.active]="activeTab() === tab"
            (click)="filterTab(tab)">
            {{ tab }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="empty">Loading invoices...</div>
      } @else if (!invoices().length) {
        <div class="empty">
          <p>No invoices yet</p>
          <a routerLink="/business/invoices/create" class="create-link">
            Create your first invoice →
          </a>
        </div>
      } @else {
        <div class="invoice-list">
          @for (inv of invoices(); track inv.id) {
            <div class="invoice-card"
              [class.disputed]="inv.status === 'DISPUTED'">

              <div class="inv-top">
                <div>
                  <p class="inv-number">{{ inv.invoiceNumber }}</p>
                  <p class="inv-to">To: <strong>{{ inv.recipientEmail }}</strong></p>
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
                  <span class="meta-val">
                    {{ inv.dueDate | date:'dd MMM yyyy' }}
                  </span>
                </div>
                <div class="inv-meta">
                  <span class="meta-label">Amount</span>
                  <span class="meta-val amount">
                    {{ inv.currency }} {{ inv.totalAmount | number:'1.2-2' }}
                  </span>
                </div>
                @if (inv.status === 'PAID') {
                  <div class="inv-meta">
                    <span class="meta-label">Paid</span>
                    <span class="meta-val paid">
                      {{ inv.currency }} {{ inv.amountPaid | number:'1.2-2' }}
                    </span>
                  </div>
                }
              </div>

              @if (inv.notes) {
                <p class="inv-notes">📝 {{ inv.notes }}</p>
              }

              <!-- Dispute reason shown to business -->
              @if (inv.status === 'DISPUTED' && inv.disputeReason) {
                <div class="dispute-box">
                  <span class="dispute-label">⚠️ Dispute Reason:</span>
                  <span class="dispute-text">{{ inv.disputeReason }}</span>
                </div>
              }

              <!-- Actions -->
              <div class="inv-actions">
                @if (inv.status === 'DRAFT') {
                  <button class="action-btn send-btn"
                    [disabled]="actionId() === inv.id"
                    (click)="sendInvoice(inv.id)">
                    {{ actionId() === inv.id ? 'Sending...' : '📤 Send Invoice' }}
                  </button>
                }
                @if (inv.status === 'DRAFT') {
                  <button class="action-btn cancel-btn"
                    [disabled]="actionId() === inv.id"
                    (click)="cancelInvoice(inv.id)">
                    Cancel
                  </button>
                }
                @if (inv.status === 'SENT') {
                  <span class="awaiting">⏳ Awaiting payment</span>
                }
                @if (inv.status === 'PAID') {
                  <span class="paid-label">✅ Payment received</span>
                }
                @if (inv.status === 'DISPUTED') {
                  <span class="disputed-label">🔴 Under dispute</span>
                }
              </div>

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

    .page-header { display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
    .page-sub { color: #64748b; font-size: 0.875rem; margin-top: 0.25rem; }
    
    .back-btn { color: #65758b; text-decoration: none; font-size: 0.85rem; }


    .new-btn { background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: white; padding: 0.6rem 1.25rem; border-radius: 10px;
      text-decoration: none; font-size: 0.875rem; font-weight: 600; }

    .filter-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.25rem;
      flex-wrap: wrap; }
    .tab-btn { background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: #64748b; padding: 0.4rem 1rem; border-radius: 8px;
      cursor: pointer; font-size: 0.82rem; transition: all 0.2s; }
    .tab-btn:hover { color: #94a3b8; }
    .tab-btn.active { background: rgba(124,58,237,0.15);
      border-color: rgba(124,58,237,0.3); color: #a78bfa; }

    .invoice-list { display: flex; flex-direction: column; gap: 1rem; }

    .invoice-card { background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; padding: 1.5rem; transition: border-color 0.2s; }
    .invoice-card:hover { border-color: rgba(255,255,255,0.15); }
    .invoice-card.disputed { border-color: rgba(239,68,68,0.3);
      background: rgba(239,68,68,0.03); }

    .inv-top { display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: 1.25rem; }
    .inv-number { color: #a78bfa; font-size: 0.9rem; font-weight: 600;
      font-family: monospace; margin-bottom: 4px; }
    .inv-to { color: #64748b; font-size: 0.82rem; }
    .inv-to strong { color: #94a3b8; }

    .status-badge { padding: 0.25rem 0.75rem; border-radius: 999px;
      font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
    .status-draft    { background: rgba(100,116,139,0.15); color: #94a3b8; }
    .status-sent     { background: rgba(59,130,246,0.15);  color: #60a5fa; }
    .status-paid     { background: rgba(34,197,94,0.15);   color: #4ade80; }
    .status-disputed { background: rgba(239,68,68,0.15);   color: #f87171; }
    .status-overdue  { background: rgba(239,68,68,0.15);   color: #f87171; }
    .status-cancelled{ background: rgba(100,116,139,0.1);  color: #64748b; }

    .inv-middle { display: flex; gap: 2rem; margin-bottom: 1rem;
      flex-wrap: wrap; }
    .meta-label { color: #475569; font-size: 0.75rem;
      display: block; margin-bottom: 3px; }
    .meta-val { color: #94a3b8; font-size: 0.875rem;
      font-weight: 500; display: block; }
    .meta-val.amount { color: #f1f5f9; font-size: 1.1rem; font-weight: 700; }
    .meta-val.paid { color: #4ade80; font-weight: 700; }

    .inv-notes { color: #64748b; font-size: 0.82rem; font-style: italic;
      margin-bottom: 1rem; padding: 0.5rem 0.75rem;
      background: rgba(255,255,255,0.03); border-radius: 8px;
      border-left: 2px solid rgba(255,255,255,0.1); }

    .dispute-box { background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 10px; padding: 0.75rem 1rem;
      margin-bottom: 1rem; }
    .dispute-label { color: #f87171; font-size: 0.8rem;
      font-weight: 600; display: block; margin-bottom: 4px; }
    .dispute-text { color: #fca5a5; font-size: 0.82rem; }

    .inv-actions { display: flex; align-items: center;
      gap: 0.75rem; margin-top: 0.75rem; flex-wrap: wrap; }

    .action-btn { padding: 0.6rem 1.25rem; border-radius: 10px;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      border: none; transition: opacity 0.2s; }
    .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .send-btn { background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: white; }
    .send-btn:hover:not(:disabled) { opacity: 0.9; }

    .cancel-btn { background: rgba(239,68,68,0.1); color: #f87171;
      border: 1px solid rgba(239,68,68,0.2) !important; }

    .awaiting { color: #fbbf24; font-size: 0.82rem; }
    .paid-label { color: #4ade80; font-size: 0.82rem; font-weight: 600; }
    .disputed-label { color: #f87171; font-size: 0.82rem; font-weight: 600; }

    .action-error { color: #f87171; font-size: 0.78rem; margin-top: 0.5rem; }

    .empty { padding: 3rem; text-align: center; color: #475569;
      background: rgba(255,255,255,0.02);
      border: 1px dashed rgba(255,255,255,0.08);
      border-radius: 16px; }
    .create-link { color: #7c3aed; text-decoration: none;
      font-size: 0.875rem; display: block; margin-top: 0.75rem; }
  `]
})
export class InvoiceListComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  tabs = ['ALL', 'DRAFT', 'SENT', 'PAID', 'DISPUTED', 'CANCELLED'];
  activeTab = signal('ALL');
  allInvoices = signal<any[]>([]);
  invoices = signal<any[]>([]);
  loading = signal(true);
  actionId = signal<number | null>(null);
  actionError = signal<string | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.dashboardService.getIssuedInvoices(0, 100).subscribe({
      next: (page) => {
        this.allInvoices.set(page.content);
        this.invoices.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterTab(tab: string) {
    this.activeTab.set(tab);
    this.invoices.set(tab === 'ALL'
      ? this.allInvoices()
      : this.allInvoices().filter(i => i.status === tab));
  }

  sendInvoice(id: number) {
    this.actionId.set(id);
    this.actionError.set(null);
    this.dashboardService.sendInvoice(id).subscribe({
      next: (updated) => {
        this.actionId.set(null);
        this.allInvoices.update(list =>
          list.map(i => i.id === id ? updated : i));
        this.filterTab(this.activeTab());
      },
      error: (err) => {
        this.actionId.set(null);
        this.actionError.set(err?.error?.message ?? 'Failed to send');
      }
    });
  }

  cancelInvoice(id: number) {
    this.actionId.set(id);
    this.dashboardService.cancelInvoice(id).subscribe({
      next: (updated) => {
        this.actionId.set(null);
        this.allInvoices.update(list =>
          list.map(i => i.id === id ? updated : i));
        this.filterTab(this.activeTab());
      },
      error: (err) => {
        this.actionId.set(null);
        this.actionError.set(err?.error?.message ?? 'Failed to cancel');
      }
    });
  }
}