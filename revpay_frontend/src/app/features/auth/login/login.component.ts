import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="card">

        <!-- Logo -->
        <div class="logo-wrap">
          <div class="logo-icon">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="white">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6
                   a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
          <h1 class="brand">RevPay</h1>
          <p class="subtitle">Sign in to your account</p>
        </div>

        <!-- Error -->
        @if (authService.error()) {
          <div class="error-banner">
            <span>⚠️</span>
            <p>{{ authService.error() }}</p>
          </div>
        }

        <!-- Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">

          <div class="field">
            <label>Email address</label>
            <input formControlName="email" type="email" placeholder="you@example.com"/>
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <span class="field-error">Please enter a valid email</span>
            }
          </div>

          <div class="field">
            <label>Password</label>
            <div class="input-wrap">
              <input
                formControlName="password"
                [type]="showPassword() ? 'text' : 'password'"
                placeholder="••••••••"/>
              <button type="button" class="eye-btn"
                (click)="showPassword.set(!showPassword())">
                {{ showPassword() ? '🙈' : '👁️' }}
              </button>
            </div>
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <span class="field-error">Password is required</span>
            }
          </div>

          <div class="forgot-wrap">
            <a routerLink="/auth/forgot-password" class="forgot-link">
              Forgot password?
            </a>
          </div>

          <button type="submit" class="submit-btn"
            [disabled]="loginForm.invalid || authService.isLoading()">
            @if (authService.isLoading()) {
              <span>Signing in...</span>
            } @else {
              <span>Sign in</span>
            }
          </button>

        </form>

        <p class="footer-text">
          Don't have an account?
          <a routerLink="/auth/register">Create one</a>
        </p>

      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      font-family: 'Segoe UI', sans-serif;
    }

    .card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.4);
    }

    .logo-wrap {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      box-shadow: 0 8px 25px rgba(59,130,246,0.4);
    }

    .brand {
      font-size: 2rem;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    .subtitle {
      color: #94a3b8;
      margin-top: 0.25rem;
      font-size: 0.95rem;
    }

    .error-banner {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 12px;
      padding: 0.875rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      color: #f87171;
      font-size: 0.875rem;
    }

    .field {
      margin-bottom: 1.25rem;
    }

    .field label {
      display: block;
      color: #cbd5e1;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .field input {
      width: 100%;
      padding: 0.875rem 1rem;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      color: #ffffff;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .field input::placeholder { color: #475569; }

    .field input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
    }

    .input-wrap {
      position: relative;
    }

    .input-wrap input {
      width: 100%;
      padding: 0.875rem 3rem 0.875rem 1rem;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      color: #ffffff;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .input-wrap input::placeholder { color: #475569; }

    .input-wrap input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
    }

    .eye-btn {
      position: absolute;
      right: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      line-height: 1;
    }

    .field-error {
      color: #f87171;
      font-size: 0.75rem;
      margin-top: 0.4rem;
      display: block;
    }

    .forgot-wrap { text-align: right; margin-top: -0.5rem; margin-bottom: 1rem; }
    .forgot-link { color: #3b82f6; font-size: 0.82rem; text-decoration: none; }
    .forgot-link:hover { text-decoration: underline; }

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
      transition: opacity 0.2s, transform 0.1s;
      box-shadow: 0 4px 15px rgba(59,130,246,0.35);
    }

    .submit-btn:hover:not(:disabled) { opacity: 0.9; }
    .submit-btn:active:not(:disabled) { transform: scale(0.98); }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .footer-text {
      text-align: center;
      color: #64748b;
      font-size: 0.875rem;
      margin-top: 1.5rem;
    }

    .footer-text a {
      color: #60a5fa;
      text-decoration: none;
      font-weight: 500;
      margin-left: 0.25rem;
    }

    .footer-text a:hover { color: #93c5fd; }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  showPassword = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.value;
    this.authService.login({ email: email!, password: password! }).subscribe();
  }
}