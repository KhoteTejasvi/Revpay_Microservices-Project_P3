import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="logo-icon">💳</span>
          <span class="logo-text">RevPay</span>
        </div>
        <h2 class="auth-title">Reset Password</h2>
        <p class="auth-sub">Enter your new password below</p>

        @if (!success()) {
          @if (!token()) {
            <div class="error-box">
              Invalid reset link. Please request a new one.
            </div>
            <a routerLink="/auth/forgot-password" class="submit-btn"
              style="text-align:center; text-decoration:none; display:block">
              Request New Link
            </a>
          } @else {
            <div class="form-group">
              <label class="form-label">New Password</label>
              <input class="form-input" type="password"
                [(ngModel)]="newPassword"
                placeholder="Min 8 characters"/>
            </div>
            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <input class="form-input" type="password"
                [(ngModel)]="confirmPassword"
                placeholder="Repeat new password"/>
            </div>

            @if (error()) {
              <div class="error-box">{{ error() }}</div>
            }

            <button class="submit-btn"
              [disabled]="loading()"
              (click)="submit()">
              {{ loading() ? 'Resetting...' : 'Reset Password' }}
            </button>
          }
        } @else {
          <div class="success-box">
            ✅ Password reset successfully!
          </div>
          <a routerLink="/auth/login" class="submit-btn"
            style="text-align:center; text-decoration:none; display:block">
            Back to Login
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center;
      justify-content: center;
      background: linear-gradient(135deg,#0f0f1a,#1a1a2e); }
    .auth-card { background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px; padding: 2.5rem; width: 100%; max-width: 420px; }
    .auth-logo { display: flex; align-items: center; gap: 0.5rem;
      margin-bottom: 1.5rem; }
    .logo-icon { font-size: 1.5rem; }
    .logo-text { font-size: 1.25rem; font-weight: 700; color: #f1f5f9; }
    .auth-title { font-size: 1.5rem; font-weight: 700;
      color: #f1f5f9; margin-bottom: 0.5rem; }
    .auth-sub { color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .form-group { margin-bottom: 1.25rem; }
    .form-label { color: #94a3b8; font-size: 0.82rem;
      font-weight: 500; display: block; margin-bottom: 0.4rem; }
    .form-input { width: 100%; background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1); color: #f1f5f9;
      padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.875rem;
      outline: none; }
    .form-input:focus { border-color: rgba(124,58,237,0.5); }
    .error-box { background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      color: #f87171; padding: 0.75rem; border-radius: 8px;
      font-size: 0.82rem; margin-bottom: 1rem; }
    .success-box { background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.2);
      color: #4ade80; padding: 1rem; border-radius: 8px;
      font-size: 0.875rem; margin-bottom: 1rem; }
    .submit-btn { width: 100%;
      background: linear-gradient(135deg,#7c3aed,#4f46e5);
      color: white; border: none; padding: 0.875rem;
      border-radius: 10px; font-size: 0.875rem; font-weight: 600;
      cursor: pointer; margin-bottom: 1rem; }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = signal('');
  newPassword = '';
  confirmPassword = '';
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  ngOnInit() {
    const t = this.route.snapshot.queryParamMap.get('token');
    this.token.set(t ?? '');
  }

  submit() {
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }
    if (this.newPassword.length < 8) {
      this.error.set('Password must be at least 8 characters');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.authService.resetPassword(this.token(), this.newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Reset failed. Token may have expired.');
      }
    });
  }
}