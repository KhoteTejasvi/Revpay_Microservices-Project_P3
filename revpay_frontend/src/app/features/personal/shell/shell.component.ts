import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
// Add to imports array
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,      // ← MUST be here
    RouterLink,
    RouterLinkActive,
    NotificationBellComponent
  ],
  template: `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-left">
        <div class="logo-mark">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0
                   00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
        <!-- <div class="topbar-left"> -->
        <!-- <div>   -->
          <span class="brand">RevPay</span>
          <span class="biz-tag">Personal</span>
        </div>

        <nav class="topnav">
          <a routerLink="/personal/dashboard" routerLinkActive="active" class="nav-link">
            Dashboard
          </a>
          <a routerLink="/personal/send" routerLinkActive="active" class="nav-link">
            Send
          </a>
          <a routerLink="/personal/top-up" routerLinkActive="active" class="nav-link">
            Top Up
          </a>
          <a routerLink="/personal/request" routerLinkActive="active" class="nav-link">
            Request
          </a>
          <a routerLink="/personal/transactions" routerLinkActive="active" class="nav-link">
            Transactions
          </a>
          <a routerLink="/personal/invoices" routerLinkActive="active" class="nav-link">Invoices</a>
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
    .shell { min-height: 100vh; background: #0f172a;
      font-family: 'Segoe UI', sans-serif; display: flex; flex-direction: column; }

    .topbar { background: rgba(255,255,255,0.03);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 0 2rem; height: 60px; display: flex;
      align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 100; gap: 1rem; }

    .topbar-left { display: flex; align-items: center; flex-shrink: 0; gap: 10px; }
    .brand { font-size: 1.1rem; font-weight: 700; color: #fff; }

    .topnav { display: flex; align-items: center; gap: 0.25rem; }
    .nav-link { color: #64748b; text-decoration: none; font-size: 0.875rem;
      padding: 0.4rem 0.875rem; border-radius: 8px; transition: all 0.2s; }
    .nav-link:hover { color: #94a3b8; background: rgba(255,255,255,0.04); }
    .nav-link.active { color: #60a5fa; background: rgba(59,130,246,0.1); }

    .topbar-right { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
    .user-name { color: #94a3b8; font-size: 0.875rem; }

    .logout-btn { background: rgba(239,68,68,0.1); color: #f87171;
      border: 1px solid rgba(239,68,68,0.2); padding: 0.4rem 1rem;
      border-radius: 8px; font-size: 0.85rem; cursor: pointer; }
    .logout-btn:hover { background: rgba(239,68,68,0.2); }

    .content { flex: 1; padding: 2rem; max-width: 1100px;
      width: 100%; margin: 0 auto; }

      .logo-mark {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #5f02ff, #0b03a5);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .biz-tag {
      background: rgba(8, 124, 232, 0.2);
      color: #60a5fa;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 500;
      border: 1px solid rgba(25, 13, 243, 0.3);
    }
  `]
})
export class ShellComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
  }
}