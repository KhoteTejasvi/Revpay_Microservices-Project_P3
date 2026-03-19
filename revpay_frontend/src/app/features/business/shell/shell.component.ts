import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-business-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationBellComponent],
  template: `
    <div class="shell">

      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left">
          <div class="logo-mark">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0
                   00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
          <span class="brand-name">RevPay</span>
          <span class="biz-tag">Business</span>
        </div>

        <nav class="topnav">
          <a routerLink="/business/dashboard" routerLinkActive="active" class="nav-link">
            Dashboard
          </a>
          <a routerLink="/business/top-up" routerLinkActive="active" class="nav-link">
            Top Up
          </a>
          <a routerLink="/business/send" routerLinkActive="active" class="nav-link">
            Send
          </a>
          <a routerLink="/business/invoices" routerLinkActive="active" class="nav-link">
            Invoices
          </a>
          <a routerLink="/business/loans" routerLinkActive="active" class="nav-link">
            Loans
          </a>
          <a routerLink="/business/transactions" routerLinkActive="active" class="nav-link">
            Transactions
          </a>
        </nav>

        <div class="topbar-right">
          <span class="user-name">{{ authService.currentUser()?.fullName }}</span>
          <button class="logout-btn" (click)="logout()">Logout</button>
          <app-notification-bell></app-notification-bell>
        </div>
      </header>

      <main class="content">
        <router-outlet />
      </main>

    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .shell {
      min-height: 100vh;
      background: #0f172a;
      font-family: 'Segoe UI', sans-serif;
      display: flex;
      flex-direction: column;
    }

    .topbar {
      background: rgba(255,255,255,0.03);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 0 2rem;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      gap: 1rem;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .logo-mark {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
    }

    .biz-tag {
      background: rgba(124,58,237,0.2);
      color: #a78bfa;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 500;
      border: 1px solid rgba(124,58,237,0.3);
    }

    .topnav {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .nav-link {
      color: #64748b;
      text-decoration: none;
      font-size: 0.875rem;
      padding: 0.4rem 0.875rem;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .nav-link:hover { color: #94a3b8; background: rgba(255,255,255,0.04); }
    .nav-link.active { color: #a78bfa; background: rgba(124,58,237,0.1); }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-shrink: 0;
    }

    .user-name { color: #94a3b8; font-size: 0.875rem; }

    .logout-btn {
      background: rgba(239,68,68,0.1);
      color: #f87171;
      border: 1px solid rgba(239,68,68,0.2);
      padding: 0.4rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .logout-btn:hover { background: rgba(239,68,68,0.2); }

    .content {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
    }
  `]
})
export class BusinessShellComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout() { this.authService.logout(); }
}