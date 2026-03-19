import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';


@Component({
  selector: 'app-apply-loan',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <a routerLink="/business/loans" class="back-btn">← Back</a>
        <h1 class="page-title">Apply for Loan</h1>
        <p class="page-sub">Business financing for your growth</p>
      </div>

      <div class="two-col">

        <!-- Form -->
        <div class="card">
          @if (success()) {
            <div class="success-banner">
              ✅ Loan application submitted! We'll review within 2-3 business days.
            </div>
          }
          @if (error()) {
            <div class="error-banner">⚠️ {{ error() }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <div class="field">
              <label>Loan Amount (USD)</label>
              <div class="amount-wrap">
                <span class="currency-tag">USD</span>
                <input formControlName="principalAmount" type="number"
                  placeholder="10000" min="1000" step="100"/>
              </div>
              @if (form.get('principalAmount')?.invalid &&
                   form.get('principalAmount')?.touched) {
                <span class="field-error">Minimum loan amount is USD 1,000</span>
              }
            </div>

            <div class="field">
              <label>Tenure</label>
              <div class="tenure-grid">
                @for (t of tenureOptions; track t.value) {
                  <button type="button" class="tenure-btn"
                    [class.active]="form.get('tenureMonths')?.value === t.value"
                    (click)="form.patchValue({ tenureMonths: t.value })">
                    {{ t.label }}
                  </button>
                }
              </div>
            </div>

            <div class="field">
              <label>Purpose</label>
              <select formControlName="purpose" class="select-input">
                <option value="">Select purpose</option>
                <option value="WORKING_CAPITAL">Working Capital</option>
                <option value="EQUIPMENT">Equipment Purchase</option>
                <option value="EXPANSION">Business Expansion</option>
                <option value="INVENTORY">Inventory</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <button type="submit" class="submit-btn"
              [disabled]="form.invalid || loading()">
              {{ loading() ? 'Submitting...' : 'Submit Application' }}
            </button>

          </form>
        </div>

        <!-- EMI Preview -->
        <div class="emi-card">
          <h3 class="emi-title">Loan Summary</h3>

          <div class="emi-row">
            <span>Principal Amount</span>
            <span class="emi-val">
              USD {{ form.get('principalAmount')?.value || 0 | number:'1.2-2' }}
            </span>
          </div>
          <div class="emi-row">
            <span>Interest Rate</span>
            <span class="emi-val">12% p.a.</span>
          </div>
          <div class="emi-row">
            <span>Tenure</span>
            <span class="emi-val">
              {{ form.get('tenureMonths')?.value || 0 }} months
            </span>
          </div>
          <div class="emi-divider"></div>
          <div class="emi-row highlight">
            <span>Monthly EMI</span>
            <span class="emi-highlight">USD {{ monthlyEmi() | number:'1.2-2' }}</span>
          </div>
          <div class="emi-row">
            <span>Total Repayable</span>
            <span class="emi-val">
              USD {{ totalRepayable() | number:'1.2-2' }}
            </span>
          </div>
          <div class="emi-row">
            <span>Total Interest</span>
            <span class="emi-val interest">
              USD {{ totalInterest() | number:'1.2-2' }}
            </span>
          </div>

          <div class="note">
            * Subject to credit assessment. Final rate may vary.
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

    .two-col { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem; }

    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px; padding: 1.75rem; }

    .success-banner { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25);
      border-radius: 12px; padding: 1rem; color: #4ade80; font-size: 0.875rem; margin-bottom: 1.25rem; }
    .error-banner { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
      border-radius: 12px; padding: 1rem; color: #f87171; font-size: 0.875rem; margin-bottom: 1.25rem; }

    .field { margin-bottom: 1.25rem; }
    .field label { display: block; color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.5rem; }
    .field-error { color: #f87171; font-size: 0.75rem; margin-top: 0.3rem; display: block; }

    .amount-wrap { display: flex; align-items: center;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; overflow: hidden; }
    .amount-wrap:focus-within { border-color: #7c3aed; }
    .currency-tag { padding: 0 1rem; color: #64748b; font-size: 0.85rem;
      border-right: 1px solid rgba(255,255,255,0.08); }
    .amount-wrap input { border: none; background: transparent; padding: 0.875rem 0.75rem;
      color: #fff; font-size: 0.95rem; outline: none; width: 100%; }

    .tenure-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
    .tenure-btn { background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: #64748b; padding: 0.5rem; border-radius: 9px;
      cursor: pointer; font-size: 0.82rem; transition: all 0.2s; }
    .tenure-btn:hover { color: #94a3b8; }
    .tenure-btn.active { background: rgba(124,58,237,0.15);
      border-color: rgba(124,58,237,0.4); color: #a78bfa; }

    .select-input { width: 100%; padding: 0.875rem 1rem;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; color: #fff; font-size: 0.875rem; outline: none; cursor: pointer; }
    .select-input:focus { border-color: #7c3aed; }
    .select-input option { background: #1e293b; }

    .submit-btn { width: 100%; padding: 0.9rem;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: white; border: none; border-radius: 10px; font-size: 0.95rem;
      font-weight: 600; cursor: pointer; margin-top: 0.5rem; transition: opacity 0.2s; }
    .submit-btn:hover:not(:disabled) { opacity: 0.9; }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* EMI Card */
    .emi-card { background: rgba(124,58,237,0.05);
      border: 1px solid rgba(124,58,237,0.15);
      border-radius: 20px; padding: 1.75rem; align-self: start; }
    .emi-title { color: #f1f5f9; font-size: 1rem; font-weight: 600; margin-bottom: 1.5rem; }

    .emi-row { display: flex; justify-content: space-between;
      padding: 0.5rem 0; color: #64748b; font-size: 0.875rem;
      border-bottom: 1px solid rgba(255,255,255,0.04); }
    .emi-row.highlight { border-bottom: none; padding-top: 0.75rem; }
    .emi-val { color: #94a3b8; font-weight: 500; }
    .emi-highlight { color: #a78bfa; font-size: 1.25rem; font-weight: 700; }
    .interest { color: #f87171; }
    .emi-divider { border-top: 1px solid rgba(124,58,237,0.2); margin: 0.5rem 0; }

    .note { color: #334155; font-size: 0.72rem; margin-top: 1.25rem;
      font-style: italic; }
  `]
})
export class ApplyLoanComponent {
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  tenureOptions = [
    { label: '6 mo', value: 6 },
    { label: '12 mo', value: 12 },
    { label: '24 mo', value: 24 },
    { label: '36 mo', value: 36 },
    { label: '48 mo', value: 48 },
    { label: '60 mo', value: 60 }
  ];

  form = this.fb.group({
    principalAmount: [null, [Validators.required, Validators.min(1000)]],
    tenureMonths: [12, Validators.required],
    purpose: ['', Validators.required]
  });

  monthlyEmi(): number {
    const p = this.form.get('principalAmount')?.value ?? 0;
    const n = this.form.get('tenureMonths')?.value ?? 12;
    const r = 12 / 100 / 12;
    if (!p || !n) return 0;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  totalRepayable(): number {
    return this.monthlyEmi() * (this.form.get('tenureMonths')?.value ?? 0);
  }

  totalInterest(): number {
    return this.totalRepayable() - (this.form.get('principalAmount')?.value ?? 0);
  }
private dashboardService = inject(DashboardService);

onSubmit() {
  if (this.form.invalid) { this.form.markAllAsTouched(); return; }
  this.loading.set(true);
  this.error.set(null);

  const val = this.form.value;
  this.dashboardService.applyLoan({
    principalAmount: val.principalAmount!,
    tenureMonths: val.tenureMonths!,
    purpose: val.purpose!
  }).subscribe({
    next: () => {
      this.loading.set(false);
      this.success.set(true);
      this.form.reset({ tenureMonths: 12 });
    },
    error: (err) => {
      this.loading.set(false);
      this.error.set(err?.error?.message ?? 'Application failed');
    }
  });
}
}