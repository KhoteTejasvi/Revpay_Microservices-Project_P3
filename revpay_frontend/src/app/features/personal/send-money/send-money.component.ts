import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-send-money',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <a routerLink="/personal/dashboard" class="back-btn">← Back</a>
        <h1 class="page-title">Send Money</h1>
        <p class="page-sub">Transfer funds to another RevPay account</p>
      </div>

      <div class="card">
        @if (success()) {
          <div class="success-banner">
            ✅ Transfer successful! Reference: <strong>{{ successRef() }}</strong>
          </div>
        }
        @if (error()) {
          <div class="error-banner">⚠️ {{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <div class="field">
            <label>Receiver Email</label>
            <input formControlName="receiverEmail" type="text"
              placeholder="REV1234567890"/>
            @if (form.get('receiverEmail')?.invalid &&
                 form.get('receiverEmail')?.touched) {
              <span class="field-error">Email is required</span>
            }
          </div>

          <div class="field">
            <label>Amount</label>
            <div class="amount-wrap">
              <span class="currency-tag">USD</span>
              <input formControlName="amount" type="number"
                placeholder="0.00" step="0.01"/>
            </div>
            @if (form.get('amount')?.invalid && form.get('amount')?.touched) {
              <span class="field-error">Enter a valid amount</span>
            }
          </div>

          <div class="field">
            <label>Note <span class="optional">(optional)</span></label>
            <input formControlName="note" type="text"
              placeholder="What's this for?"/>
          </div>

          <button type="submit" class="submit-btn"
            [disabled]="form.invalid || loading()">
            {{ loading() ? 'Sending...' : 'Send Money' }}
          </button>

        </form>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .page { font-family: 'Segoe UI', sans-serif; color: #e2e8f0; max-width: 520px; }

    .page-header { margin-bottom: 1.5rem; }

    .back-btn {
      color: #64748b;
      text-decoration: none;
      font-size: 0.85rem;
      display: inline-block;
      margin-bottom: 0.75rem;
      transition: color 0.2s;
    }

    .back-btn:hover { color: #94a3b8; }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f1f5f9;
    }

    .page-sub {
      color: #64748b;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 2rem;
    }

    .success-banner {
      background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.25);
      border-radius: 12px;
      padding: 1rem;
      color: #4ade80;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .error-banner {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 12px;
      padding: 1rem;
      color: #f87171;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .field { margin-bottom: 1.25rem; }

    .field label {
      display: block;
      color: #94a3b8;
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .optional { color: #475569; font-weight: 400; }

    .field input {
      width: 100%;
      padding: 0.875rem 1rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: #fff;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .field input:focus {
      border-color: #3b82f6;
    }

    .field input::placeholder { color: #334155; }

    .amount-wrap {
      display: flex;
      align-items: center;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      overflow: hidden;
      transition: border-color 0.2s;
    }

    .amount-wrap:focus-within { border-color: #3b82f6; }

    .currency-tag {
      padding: 0 1rem;
      color: #64748b;
      font-size: 0.85rem;
      border-right: 1px solid rgba(255,255,255,0.08);
      height: 100%;
      display: flex;
      align-items: center;
    }

    .amount-wrap input {
      border: none;
      border-radius: 0;
      background: transparent;
      padding-left: 0.75rem;
    }

    .amount-wrap input:focus { border-color: transparent; }

    .field-error {
      color: #f87171;
      font-size: 0.75rem;
      margin-top: 0.4rem;
      display: block;
    }

    .submit-btn {
      width: 100%;
      padding: 0.9rem;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
      transition: opacity 0.2s;
    }

    .submit-btn:hover:not(:disabled) { opacity: 0.9; }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class SendMoneyComponent {
  private fb = inject(FormBuilder);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  successRef = signal<string>('');

  form = this.fb.group({
    receiverEmail: ['', Validators.required],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    note: ['']
  });

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    const { receiverEmail, amount, note } = this.form.value;
    this.dashboardService.transfer({
      receiverEmail: receiverEmail!,
      amount: amount!,
      note: note ?? undefined
    }).subscribe({
      next: (tx) => {
        this.loading.set(false);
        this.success.set(true);
        this.successRef.set(tx.referenceNumber);
        this.form.reset();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Transfer failed');
      }
    });
  }
}