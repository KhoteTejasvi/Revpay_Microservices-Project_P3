import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="logo-icon">💳</span>
          <span class="logo-text">RevPay</span>
        </div>
        <h2 class="auth-title">Forgot Password</h2>
        <p class="auth-sub">
          Enter your email and we'll send you a reset link
        </p>

        @if (!submitted()) {
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input class="form-input"
              type="email"
              [(ngModel)]="email"
              placeholder="you@example.com"/>
          </div>

          @if (error()) {
            <div class="error-box">{{ error() }}</div>
          }

          <button class="submit-btn"
            [disabled]="loading() || !email"
            (click)="submit()">
            {{ loading() ? 'Sending...' : 'Send Reset Link' }}
          </button>
        } @else {
          <div class="success-box">
            ✅ If that email exists in our system, a reset link has been sent.
            Check your inbox (and spam folder).
          </div>
        }

        <a routerLink="/auth/login" class="back-link">← Back to Login</a>
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
      font-size: 0.875rem; margin-bottom: 1rem; line-height: 1.5; }
    .submit-btn { width: 100%;
      background: linear-gradient(135deg,#7c3aed,#4f46e5);
      color: white; border: none; padding: 0.875rem;
      border-radius: 10px; font-size: 0.875rem; font-weight: 600;
      cursor: pointer; margin-bottom: 1rem; }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .back-link { color: #7c3aed; text-decoration: none;
      font-size: 0.875rem; display: block; text-align: center; }
  `]
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  email = '';
  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);

  submit() {
    if (!this.email) return;
    this.loading.set(true);
    this.error.set(null);
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.loading.set(false);
        // Still show success for security
        this.submitted.set(true);
      }
    });
  }
}