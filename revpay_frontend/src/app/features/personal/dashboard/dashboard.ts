import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardResponse, TransactionResponse } from '../../../core/models/dashboard.models';
import { DecimalPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="page">

      <!-- Balance Card -->
      <div class="balance-card">
        <div class="balance-left">
          <p class="balance-label">Total Balance</p>
          <h2 class="balance-amount">
            {{ dashboard()?.primaryAccount?.currency ?? 'USD' }}
            {{ dashboard()?.totalBalance | number:'1.2-2' }}
          </h2>
          <p class="account-number">
            {{ dashboard()?.primaryAccount?.accountNumber }}
          </p>
        </div>
        <div class="balance-right">
          <span class="account-type">
            {{ dashboard()?.primaryAccount?.accountType }}
          </span>
          <span class="account-status active">
            {{ dashboard()?.primaryAccount?.status }}
          </span>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card">
          <p class="stat-label">Total Transactions</p>
          <p class="stat-value">{{ dashboard()?.totalTransactions ?? 0 }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Pending Requests</p>
          <p class="stat-value warn">{{ dashboard()?.pendingMoneyRequests ?? 0 }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Account</p>
          <p class="stat-value">{{ dashboard()?.role }}</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section-title">Quick Actions</div>
      <div class="actions-grid">
        <a routerLink="/personal/send" class="action-card">
          <div class="action-icon send">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </div>
          <span class="action-label">Send</span>
        </a>

        <a routerLink="/personal/top-up" class="action-card">
          <div class="action-icon topup">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3
                   3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
          <span class="action-label">Top Up</span>
        </a>

        <a routerLink="/personal/request" class="action-card">
          <div class="action-icon request">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4
                   4l-4-4"/>
            </svg>
          </div>
          <span class="action-label">Request</span>
        </a>

        <a routerLink="/personal/transactions" class="action-card">
          <div class="action-icon history">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0
                   002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002
                   2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <span class="action-label">History</span>
        </a>
      </div>

      <!-- Recent Transactions -->
      <div class="section-title" style="margin-top:2rem">
        Recent Transactions
        <a routerLink="/personal/transactions" class="see-all">See all</a>
      </div>

      <div class="tx-list">
        @if (loading()) {
          <div class="empty-state">Loading...</div>
        } @else if (!dashboard()?.recentTransactions?.length) {
          <div class="empty-state">No transactions yet</div>
        } @else {
          @for (tx of dashboard()!.recentTransactions; track tx.id) {
            <div class="tx-item">
              <div class="tx-icon"
                [class]="credit(tx) ? 'tx-icon-credit' : 'tx-icon-debit'">
                {{ credit(tx) ? '↓' : '↑' }}
              </div>
              <div class="tx-info">
                <p class="tx-ref">{{ tx.referenceNumber }}</p>
                <p class="tx-desc">{{ tx.description || tx.type }}</p>
              </div>
              <div class="tx-right">
                <p class="tx-amount"
                  [class]="credit(tx) ? 'credit' : 'debit'">
                  {{ credit(tx) ? '+' : '-' }}{{ tx.currency }}
                  {{ tx.amount | number:'1.2-2' }}
                </p>
                <span class="tx-status" [class]="'status-' + tx.status.toLowerCase()">
                  {{ tx.status }}
                </span>
              </div>
            </div>
          }
        }
      </div>

    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .page { font-family: 'Segoe UI', sans-serif; color: #e2e8f0; }

    /* Balance Card */
    .balance-card {
      background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%);
      border: 1px solid rgba(59,130,246,0.2);
      border-radius: 20px;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .balance-label {
      color: rgba(255,255,255,0.6);
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
    }

    .balance-amount {
      font-size: 2.2rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.5px;
    }

    .account-number {
      color: rgba(255,255,255,0.5);
      font-size: 0.8rem;
      margin-top: 0.5rem;
      font-family: monospace;
      letter-spacing: 1px;
    }

    .balance-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .account-type {
      background: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.8);
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
    }

    .account-status.active {
      background: rgba(34,197,94,0.15);
      color: #4ade80;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
    }

    /* Stats */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 1.25rem;
    }

    .stat-label {
      color: #64748b;
      font-size: 0.8rem;
      margin-bottom: 0.4rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f1f5f9;
    }

    .stat-value.warn { color: #fbbf24; }

    /* Section Title */
    .section-title {
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .see-all {
      color: #3b82f6;
      text-decoration: none;
      font-size: 0.8rem;
      text-transform: none;
      letter-spacing: 0;
    }

    /* Actions */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .action-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
    }

    .action-card:hover {
      background: rgba(255,255,255,0.07);
      border-color: rgba(255,255,255,0.15);
      transform: translateY(-2px);
    }

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-icon.send    { background: rgba(59,130,246,0.15); color: #60a5fa; }
    .action-icon.topup   { background: rgba(34,197,94,0.15);  color: #4ade80; }
    .action-icon.request { background: rgba(251,191,36,0.15); color: #fbbf24; }
    .action-icon.history { background: rgba(168,85,247,0.15); color: #c084fc; }

    .action-label {
      color: #cbd5e1;
      font-size: 0.85rem;
      font-weight: 500;
    }

    /* Transactions */
    .tx-list {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      overflow: hidden;
    }

    .tx-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      transition: background 0.15s;
    }

    .tx-item:last-child { border-bottom: none; }
    .tx-item:hover { background: rgba(255,255,255,0.03); }

    .tx-icon {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .tx-icon-credit { background: rgba(34,197,94,0.15);  color: #4ade80; }
    .tx-icon-debit  { background: rgba(239,68,68,0.15);  color: #f87171; }

    .tx-info { flex: 1; }
    .tx-ref  { color: #f1f5f9; font-size: 0.85rem; font-weight: 500; }
    .tx-desc { color: #64748b; font-size: 0.78rem; margin-top: 2px; }

    .tx-right { text-align: right; }

    .tx-amount {
      font-size: 0.95rem;
      font-weight: 600;
    }

    .tx-amount.credit { color: #4ade80; }
    .tx-amount.debit  { color: #f87171; }

    .tx-status {
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      margin-top: 3px;
      display: inline-block;
    }

    .status-completed { background: rgba(34,197,94,0.1);  color: #4ade80; }
    .status-pending   { background: rgba(251,191,36,0.1); color: #fbbf24; }
    .status-failed    { background: rgba(239,68,68,0.1);  color: #f87171; }

    .empty-state {
      padding: 2rem;
      text-align: center;
      color: #475569;
      font-size: 0.9rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);

  dashboard = signal<DashboardResponse | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // credit(tx: any): boolean {
  //   const myAccountId = this.dashboard()?.primaryAccount?.id;
  //   return tx.receiverAccountId === myAccountId;
  // }
  credit(tx: TransactionResponse): boolean {
    // return tx.receiverAccountId === this.myAccountId();
    return tx.credit;
  }

}