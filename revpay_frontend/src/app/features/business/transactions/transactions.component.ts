import { Component, inject, signal, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { TransactionResponse } from '../../../core/models/dashboard.models';
import { CommonModule } from '@angular/common';
import { ExportTransactionsComponent } from '../../../core/services/export-transaction/export-transaction.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ExportTransactionsComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1 class="page-title">Transaction History</h1>
        <p class="page-sub">{{ totalElements() }} total transactions</p>
      </div>

      <div class="tx-list">
        @if (loading()) {
          <div class="empty-state">Loading transactions...</div>
        } @else if (!transactions().length) {
          <div class="empty-state">No transactions found</div>
        } @else {
          @for (tx of transactions(); track tx.id) {
            <div class="tx-item">
              <div class="tx-icon"
                [class]="tx.credit ? 'tx-icon-credit' : 'tx-icon-debit'">
                {{ tx.credit ? '↓' : '↑' }}
              </div>
              <div class="tx-info">
                <p class="tx-ref">{{ tx.referenceNumber }}</p>
                <p class="tx-desc">{{ tx.description || tx.type }}</p>
                <p class="tx-date">{{ tx.createdAt | date:'dd MMM yyyy, HH:mm' }}</p>
              </div>
              <div class="tx-right">
                <p class="tx-amount" [class]="tx.credit ? 'credit' : 'debit'">
                  {{ tx.credit ? '+' : '-' }}{{ tx.currency }}
                  {{ tx.amount | number:'1.2-2' }}
                </p>
                <span class="tx-status" [class]="'status-' + tx.status.toLowerCase()">
                  {{ tx.status }}
                </span>
                <p class="tx-type">{{ tx.type }}</p>
              </div>
            </div>
          }
        }
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="pagination">
          <button class="page-btn"
            [disabled]="currentPage() === 0"
            (click)="goToPage(currentPage() - 1)">← Prev</button>
          <span class="page-info">
            Page {{ currentPage() + 1 }} of {{ totalPages() }}
          </span>
          <button class="page-btn"
            [disabled]="currentPage() >= totalPages() - 1"
            (click)="goToPage(currentPage() + 1)">Next →</button>
        </div>
      }

      <!-- Export Panel -->
      <div style="margin-top: 2rem;">
        <app-export-transactions />
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .page { font-family: 'Segoe UI', sans-serif; color: #e2e8f0; }

    .page-header { margin-bottom: 1.5rem; }
    .back-btn { background: none; border: none; color: #64748b;
      font-size: 0.85rem; cursor: pointer; margin-bottom: 0.75rem;
      display: inline-block; padding: 0; }
    .back-btn:hover { color: #94a3b8; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
    .page-sub { color: #64748b; font-size: 0.875rem; margin-top: 0.25rem; }

    .tx-list { background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px; overflow: hidden; }

    .tx-item { display: flex; align-items: center; gap: 1rem;
      padding: 1.1rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      transition: background 0.15s; }
    .tx-item:last-child { border-bottom: none; }
    .tx-item:hover { background: rgba(255,255,255,0.03); }

    .tx-icon { width: 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem; font-weight: 700; flex-shrink: 0; }
    .tx-icon-credit { background: rgba(34,197,94,0.15); color: #4ade80; }
    .tx-icon-debit  { background: rgba(239,68,68,0.15);  color: #f87171; }

    .tx-info { flex: 1; }
    .tx-ref  { color: #f1f5f9; font-size: 0.85rem; font-weight: 500; }
    .tx-desc { color: #64748b; font-size: 0.78rem; margin-top: 2px; }
    .tx-date { color: #334155; font-size: 0.72rem; margin-top: 3px; }

    .tx-right { text-align: right; }
    .tx-amount { font-size: 0.95rem; font-weight: 600; }
    .tx-amount.credit { color: #4ade80; }
    .tx-amount.debit  { color: #f87171; }

    .tx-status { font-size: 0.7rem; padding: 0.15rem 0.5rem;
      border-radius: 999px; margin-top: 3px; display: inline-block; }
    .status-completed { background: rgba(34,197,94,0.1);  color: #4ade80; }
    .status-pending   { background: rgba(251,191,36,0.1); color: #fbbf24; }
    .status-failed    { background: rgba(239,68,68,0.1);  color: #f87171; }

    .tx-type { color: #334155; font-size: 0.7rem; margin-top: 2px; }

    .empty-state { padding: 3rem; text-align: center;
      color: #475569; font-size: 0.9rem; }

    .pagination { display: flex; align-items: center;
      justify-content: center; gap: 1.5rem; margin-top: 1.5rem; }
    .page-btn { background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: #94a3b8; padding: 0.5rem 1.25rem; border-radius: 10px;
      cursor: pointer; font-size: 0.875rem; transition: all 0.2s; }
    .page-btn:hover:not(:disabled) { border-color: rgba(255,255,255,0.2); color: #f1f5f9; }
    .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .page-info { color: #64748b; font-size: 0.875rem; }
  `]
})
export class TransactionsComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private location = inject(Location);

  transactions = signal<TransactionResponse[]>([]);
  loading = signal(true);
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.dashboardService.getTransactionHistory(this.currentPage(), 10).subscribe({
      next: (page) => {
        this.transactions.set(page.content);
        this.totalPages.set(page.totalPages);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.load();
  }

  goBack() { this.location.back(); }
}

export { TransactionsComponent as BusinessTransactionsComponent };