import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

type RegisterRole = 'PERSONAL' | 'BUSINESS';

@Component({
  selector: 'app-register',
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
          <p class="subtitle">Create your account</p>
        </div>

        <!-- Role Toggle -->
        <div class="role-toggle">
          @for (role of roles; track role.value) {
            <button type="button"
              [class]="selectedRole() === role.value ? 'role-btn active' : 'role-btn'"
              (click)="selectRole(role.value)">
              {{ role.label }}
            </button>
          }
        </div>

        <!-- Error -->
        @if (authService.error()) {
          <div class="error-banner">
            <span>⚠️</span>
            <p>{{ authService.error() }}</p>
          </div>
        }

        <!-- Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">

          <div class="field">
            <label>{{ selectedRole() === 'BUSINESS' ? 'Business Name' : 'Full Name' }}</label>
            <input formControlName="fullName" type="text"
              [placeholder]="selectedRole() === 'BUSINESS' ? 'Acme Corp' : 'John Doe'"/>
            @if (f['fullName'].invalid && f['fullName'].touched) {
              <span class="field-error">Name is required (min 2 characters)</span>
            }
          </div>

          <div class="field">
            <label>Email address</label>
            <input formControlName="email" type="email" placeholder="you@example.com"/>
            @if (f['email'].invalid && f['email'].touched) {
              <span class="field-error">Valid email is required</span>
            }
          </div>

          <div class="field">
            <label>
              Phone
              @if (selectedRole() === 'PERSONAL') {
                <span class="optional">(optional)</span>
              }
            </label>
            <input formControlName="phone" type="tel" placeholder="+1234567890"/>
            @if (f['phone'].invalid && f['phone'].touched) {
              <span class="field-error">Enter a valid phone number</span>
            }
          </div>

          @if (selectedRole() === 'BUSINESS') {
            <div class="field">
              <label>Business Registration Number</label>
              <input formControlName="businessRegistrationNumber" type="text"
                placeholder="BRN-001"/>
              @if (f['businessRegistrationNumber'].invalid &&
                   f['businessRegistrationNumber'].touched) {
                <span class="field-error">Business registration number is required</span>
              }
            </div>
          }

          <div class="field">
            <label>Password</label>
            <div class="input-wrap">
              <input formControlName="password"
                [type]="showPassword() ? 'text' : 'password'"
                placeholder="••••••••"/>
              <button type="button" class="eye-btn"
                (click)="showPassword.set(!showPassword())">
                {{ showPassword() ? '🙈' : '👁️' }}
              </button>
            </div>
            @if (f['password'].invalid && f['password'].touched) {
              <span class="field-error">
                Min 8 chars with uppercase, lowercase, digit & special character
              </span>
            }
          </div>

          <!-- Password Strength -->
          @if (f['password'].value) {
            <div class="strength-bars">
              @for (bar of strengthBars(); track $index) {
                <div class="strength-bar" [style.background]="bar"></div>
              }
            </div>
          }

          <button type="submit" class="submit-btn"
            [disabled]="registerForm.invalid || authService.isLoading()">
            @if (authService.isLoading()) {
              Creating account...
            } @else {
              Create {{ selectedRole() === 'BUSINESS' ? 'Business' : 'Personal' }} Account
            }
          </button>

        </form>

        <p class="footer-text">
          Already have an account?
          <a routerLink="/auth/login">Sign in</a>
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
      margin-bottom: 1.5rem;
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

    .role-toggle {
      display: flex;
      background: rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 1.5rem;
    }

    .role-btn {
      flex: 1;
      padding: 0.6rem;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: #94a3b8;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .role-btn.active {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      box-shadow: 0 4px 12px rgba(59,130,246,0.3);
    }

    .error-banner {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 12px;
      padding: 0.875rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      color: #f87171;
      font-size: 0.875rem;
    }

    .field {
      margin-bottom: 1.1rem;
    }

    .field label {
      display: block;
      color: #cbd5e1;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .optional {
      color: #64748b;
      font-weight: 400;
      margin-left: 0.25rem;
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

    .input-wrap { position: relative; }

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
    }

    .field-error {
      color: #f87171;
      font-size: 0.75rem;
      margin-top: 0.4rem;
      display: block;
    }

    .strength-bars {
      display: flex;
      gap: 6px;
      margin-bottom: 1rem;
      margin-top: -0.5rem;
    }

    .strength-bar {
      height: 4px;
      flex: 1;
      border-radius: 999px;
      transition: background 0.3s;
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
export class RegisterComponent {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  showPassword = signal(false);
  selectedRole = signal<RegisterRole>('PERSONAL');

  roles = [
    { value: 'PERSONAL' as RegisterRole, label: '👤 Personal' },
    { value: 'BUSINESS' as RegisterRole, label: '🏢 Business' }
  ];

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^\+?[1-9]\d{7,14}$/)]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
    ]],
    businessRegistrationNumber: ['']
  });

  get f() { return this.registerForm.controls; }

  selectRole(role: RegisterRole) {
    this.selectedRole.set(role);
    this.authService.clearError();
    const brn = this.f['businessRegistrationNumber'];
    const phone = this.f['phone'];
    if (role === 'BUSINESS') {
      brn.setValidators(Validators.required);
      phone.setValidators([Validators.required, Validators.pattern(/^\+?[1-9]\d{7,14}$/)]);
    } else {
      brn.clearValidators();
      brn.reset('');
      phone.setValidators([Validators.pattern(/^\+?[1-9]\d{7,14}$/)]);
    }
    brn.updateValueAndValidity();
    phone.updateValueAndValidity();
  }

  strengthBars() {
    const pwd = this.f['password'].value ?? '';
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&]/.test(pwd)) score++;
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
    return Array.from({ length: 4 }, (_, i) =>
      i < score ? colors[score - 1] : '#1e293b'
    );
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const { fullName, email, password, phone, businessRegistrationNumber } = this.registerForm.value;
    if (this.selectedRole() === 'BUSINESS') {
      this.authService.registerBusiness({
        fullName: fullName!, email: email!,
        password: password!, phone: phone!,
        businessRegistrationNumber: businessRegistrationNumber!
      }).subscribe();
    } else {
      this.authService.registerPersonal({
        fullName: fullName!, email: email!,
        password: password!, phone: phone ?? undefined
      }).subscribe();
    }
  }
}