import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError, Observable } from 'rxjs';
import {
  AuthResponse, AuthUser, ApiResponse,
  LoginRequest, RegisterPersonalRequest, RegisterBusinessRequest, Role
} from '../models/auth.models';

const API_BASE = 'http://localhost:8080/api';
const TOKEN_KEY = 'revpay_access_token';
const REFRESH_KEY = 'revpay_refresh_token';
const USER_KEY = 'revpay_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);

  // ── Signals ──────────────────────────────────────────────
  private _currentUser = signal<AuthUser | null>(this.loadUserFromStorage());
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // ── Public computed ──────────────────────────────────────
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly userRole = computed(() => this._currentUser()?.role ?? null);
  readonly isPersonal = computed(() => this._currentUser()?.role === 'PERSONAL');
  readonly isBusiness = computed(() => this._currentUser()?.role === 'BUSINESS');
  readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');

  // ── Register Personal ────────────────────────────────────
  registerPersonal(payload: RegisterPersonalRequest) {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<ApiResponse<AuthResponse>>(
      `${API_BASE}/auth/register/personal`, payload
    ).pipe(
      tap(res => this.handleAuthSuccess(res.data)),
      catchError(err => this.handleError(err))
    );
  }

  // ── Register Business ────────────────────────────────────
  registerBusiness(payload: RegisterBusinessRequest) {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<ApiResponse<AuthResponse>>(
      `${API_BASE}/auth/register/business`, payload
    ).pipe(
      tap(res => this.handleAuthSuccess(res.data)),
      catchError(err => this.handleError(err))
    );
  }

  // ── Login ────────────────────────────────────────────────
  login(payload: LoginRequest) {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<ApiResponse<AuthResponse>>(
      `${API_BASE}/auth/login`, payload
    ).pipe(
      tap(res => this.handleAuthSuccess(res.data)),
      catchError(err => this.handleError(err))
    );
  }

  // ── Logout ───────────────────────────────────────────────
  logout() {
    this.http.post(`${API_BASE}/auth/logout`, {}).subscribe();
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  // ── Token helpers ────────────────────────────────────────
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // ── Private ──────────────────────────────────────────────
  private handleAuthSuccess(data: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, data.token);
if (data.refreshToken) {
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
  }
     const user: AuthUser = {
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    primaryAccountId: data.accountId   // backend sends "accountId"
  };

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
    this._isLoading.set(false);
    this.redirectByRole(data.role);
  }

  private handleError(err: any) {
    this._isLoading.set(false);
    const message = err?.error?.message ?? 'Something went wrong. Please try again.';
    this._error.set(message);
    return throwError(() => new Error(message));
  }

  public clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private redirectByRole(role: Role) {
    const routes: Record<Role, string> = {
      PERSONAL: '/personal/dashboard',
      BUSINESS: '/business/dashboard',
      ADMIN: '/admin/dashboard'
    };
    this.router.navigate([routes[role]]);
  }

  clearError() {
    this._error.set(null);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${API_BASE}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${API_BASE}/auth/reset-password`, { token, newPassword });
  }

}