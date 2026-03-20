import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { PinService } from '../../../core/services/pin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-set-pin',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="card">
        <div class="icon">🔐</div>
        <h1>Set Transaction PIN</h1>
        <p class="sub">Create a secure PIN to authorize all transactions</p>

        @if (error()) {
          <div class="error-banner">⚠️ {{ error() }}</div>
        }
        @if (success()) {
          <div class="success-banner">✅ PIN set! Redirecting to dashboard...</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label>Transaction PIN</label>
            <input formControlName="pin" type="password" inputmode="numeric"
              placeholder="Enter 4 or 6 digit PIN" maxlength="6"/>
            @if (form.get('pin')?.invalid && form.get('pin')?.touched) {
              <span class="field-error">PIN must be 4 or 6 digits (numbers only)</span>
            }
          </div>

          <div class="field">
            <label>Confirm PIN</label>
            <input formControlName="confirmPin" type="password" inputmode="numeric"
              placeholder="Re-enter your PIN" maxlength="6"/>
            @if (form.errors?.['mismatch'] && form.get('confirmPin')?.touched) {
              <span class="field-error">PINs do not match</span>
            }
          </div>

          <button type="submit" class="submit-btn"
            [disabled]="form.invalid || loading()">
            {{ loading() ? 'Setting PIN...' : 'Set Transaction PIN' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .page {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: #0f172a; padding: 1rem;
    }
    .card {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      padding: 2.5rem;
      width: 100%; max-width: 420px;
      text-align: center;
    }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 { color: #f1f5f9; font-size: 1.5rem; margin-bottom: 0.5rem; }
    .sub { color: #64748b; font-size: 0.875rem; margin-bottom: 2rem; }
    .error-banner {
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
      border-radius: 12px; padding: 0.875rem; color: #f87171;
      font-size: 0.875rem; margin-bottom: 1.5rem;
    }
    .success-banner {
      background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25);
      border-radius: 12px; padding: 0.875rem; color: #4ade80;
      font-size: 0.875rem; margin-bottom: 1.5rem;
    }
    .field { margin-bottom: 1.25rem; text-align: left; }
    .field label { display: block; color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.5rem; }
    .field input {
      width: 100%; padding: 0.875rem 1rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; color: #fff; font-size: 1rem;
      outline: none; letter-spacing: 0.3rem; text-align: center;
    }
    .field input:focus { border-color: #3b82f6; }
    .field-error { color: #f87171; font-size: 0.75rem; margin-top: 0.4rem; display: block; }
    .submit-btn {
      width: 100%; padding: 0.9rem;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white; border: none; border-radius: 12px;
      font-size: 1rem; font-weight: 600; cursor: pointer; margin-top: 0.5rem;
    }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class SetPinComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pinService = inject(PinService);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  form = this.fb.group({
    pin: ['', [Validators.required, Validators.pattern(/^\d{4}$|^\d{6}$/)]],
    confirmPin: ['', Validators.required]
  }, { validators: this.pinMatchValidator });

  ngOnInit() {
    // If PIN already set, redirect to dashboard — can't set it again
    this.pinService.getPinStatus().subscribe({
      next: (status) => {
        if (status.pinSet) {
          const role = this.authService.userRole();
          this.router.navigate([role === 'BUSINESS' ? '/business/dashboard' : '/personal/dashboard']);
        }
      },
      error: () => {} // ignore errors, let user stay on page
    });
  }

  pinMatchValidator(group: AbstractControl) {
    const pin = group.get('pin')?.value;
    const confirm = group.get('confirmPin')?.value;
    return pin === confirm ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);

    const { pin, confirmPin } = this.form.value;
    this.pinService.setPin(pin!, confirmPin!).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        const role = this.authService.userRole();
        setTimeout(() => {
          this.router.navigate([role === 'BUSINESS' ? '/business/dashboard' : '/personal/dashboard']);
        }, 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Failed to set PIN');
      }
    });
  }
}
