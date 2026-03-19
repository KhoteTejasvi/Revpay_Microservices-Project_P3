import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';


@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">My Loans</h1>
          <p class="page-sub">Track your loan applications and repayments</p>
        </div>
        <a routerLink="/business/loans/apply" class="new-btn">+ Apply for Loan</a>
      </div>

      @if (!loans().length) {
        <div class="empty-wrap">
          <div class="empty-icon">🏦</div>
          <p class="empty-title">No loan applications yet</p>
          <p class="empty-sub">Apply for business financing to get started</p>
          <a routerLink="/business/loans/apply" class="new-btn">
            Apply for Loan
          </a>
        </div>
      }

      <div class="loans-grid">
        @for (loan of loans(); track loan.id) {
          <div class="loan-card">
            <div class="loan-top">
              <div>
                <p class="loan-number">{{ loan.loanNumber }}</p>
                <p class="loan-purpose">{{ loan.purpose }}</p>
              </div>
              <span class="loan-status" [class]="'lstatus-' + loan.status.toLowerCase()">
                {{ loan.status }}
              </span>
            </div>

            <div class="loan-amount">
              USD {{ loan.principalAmount | number:'1.2-2' }}
            </div>

            <div class="loan-progress-wrap">
              <div class="loan-progress-bar">
                <div class="loan-progress-fill"
                  [style.width]="loanProgress(loan) + '%'">
                </div>
              </div>
              <p class="loan-progress-label">
                {{ loanProgress(loan) | number:'1.0-0' }}% repaid
              </p>
            </div>

            <div class="loan-meta">
              <div class="meta-item">
                <span class="meta-label">Monthly EMI</span>
                <span class="meta-val">
                  USD {{ loan.monthlyEmiAmount | number:'1.2-2' }}
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Tenure</span>
                <span class="meta-val">{{ loan.tenureMonths }} months</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Rate</span>
                <span class="meta-val">{{ loan.interestRate }}% p.a.</span>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .page { font-family: 'Segoe UI', sans-serif; color: #e2e8f0; }

    .page-header { display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
    .page-sub { color: #64748b; font-size: 0.875rem; margin-top: 0.25rem; }

    .new-btn { background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: white; padding: 0.6rem 1.25rem; border-radius: 10px;
      text-decoration: none; font-size: 0.875rem; font-weight: 600; }

    .empty-wrap { text-align: center; padding: 4rem 2rem;
      background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.08);
      border-radius: 20px; }
    .empty-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .empty-title { color: #f1f5f9; font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
    .empty-sub { color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem; }

    .loans-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }

    .loan-card { background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px; padding: 1.5rem; }

    .loan-top { display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: 1rem; }
    .loan-number { color: #a78bfa; font-size: 0.85rem;
      font-weight: 500; font-family: monospace; }
    .loan-purpose { color: #64748b; font-size: 0.78rem; margin-top: 2px; }

    .loan-status { padding: 0.2rem 0.65rem; border-radius: 999px;
      font-size: 0.72rem; font-weight: 500; }
    .lstatus-applied       { background: rgba(59,130,246,0.15); color: #60a5fa; }
    .lstatus-under_review  { background: rgba(251,191,36,0.15); color: #fbbf24; }
    .lstatus-approved      { background: rgba(34,197,94,0.15);  color: #4ade80; }
    .lstatus-disbursed     { background: rgba(34,197,94,0.15);  color: #4ade80; }
    .lstatus-active        { background: rgba(20,184,166,0.15); color: #2dd4bf; }
    .lstatus-closed        { background: rgba(100,116,139,0.15);color: #94a3b8; }
    .lstatus-defaulted     { background: rgba(239,68,68,0.15);  color: #f87171; }
    .lstatus-rejected      { background: rgba(239,68,68,0.15);  color: #f87171; }

    .loan-amount { font-size: 1.5rem; font-weight: 700;
      color: #f1f5f9; margin-bottom: 1rem; }

    .loan-progress-wrap { margin-bottom: 1.25rem; }
    .loan-progress-bar { height: 6px; background: rgba(255,255,255,0.08);
      border-radius: 999px; overflow: hidden; margin-bottom: 0.4rem; }
    .loan-progress-fill { height: 100%;
      background: linear-gradient(90deg, #7c3aed, #a78bfa);
      border-radius: 999px; transition: width 0.4s; }
    .loan-progress-label { color: #64748b; font-size: 0.75rem; }

    .loan-meta { display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem; padding-top: 1rem;
      border-top: 1px solid rgba(255,255,255,0.06); }
    .meta-item { }
    .meta-label { color: #475569; font-size: 0.72rem; display: block; }
    .meta-val { color: #94a3b8; font-size: 0.85rem;
      font-weight: 500; margin-top: 2px; display: block; }
  `]
})

export class LoanListComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  loans = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.dashboardService.getMyLoans(0, 20).subscribe({
      next: (page) => {
        this.loans.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loanProgress(loan: any): number {
    if (!loan.totalRepayableAmount) return 0;
    return (loan.amountRepaid / loan.totalRepayableAmount) * 100;
  }
}