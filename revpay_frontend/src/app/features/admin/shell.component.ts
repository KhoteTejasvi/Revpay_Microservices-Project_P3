import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-left">
          <div class="logo-mark">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955
                   11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824
                   10.29 9 11.622 5.176-1.332 9-6.03 9-11.622
                   0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <span class="brand">RevPay</span>
          <span class="admin-tag">Admin</span>
        </div>

        <nav class="topnav">
          <a routerLink="/admin/dashboard" routerLinkActive="active"
            class="nav-link">Dashboard</a>
          <a routerLink="/admin/users" routerLinkActive="active"
            class="nav-link">Users</a>
          <a routerLink="/admin/loans" routerLinkActive="active"
            class="nav-link">Loans</a>  
        </nav>

        <div class="topbar-right">
          <span class="user-name">{{ auth.currentUser()?.fullName }}</span>
          <button class="logout-btn" (click)="logout()">Logout</button>
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
    .topbar-left { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
    .logo-mark { width: 36px; height: 36px;
      background: linear-gradient(135deg, #dc2626, #991b1b);
      border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .brand { font-size: 1.1rem; font-weight: 700; color: #fff; }
    .admin-tag { background: rgba(220,38,38,0.2); color: #f87171;
      padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem;
      font-weight: 500; border: 1px solid rgba(220,38,38,0.3); }
    .topnav { display: flex; gap: 0.25rem; }
    .nav-link { color: #64748b; text-decoration: none; font-size: 0.875rem;
      padding: 0.4rem 0.875rem; border-radius: 8px; transition: all 0.2s; }
    .nav-link:hover { color: #94a3b8; background: rgba(255,255,255,0.04); }
    .nav-link.active { color: #f87171; background: rgba(220,38,38,0.1); }
    .topbar-right { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
    .user-name { color: #94a3b8; font-size: 0.875rem; }
    .logout-btn { background: rgba(239,68,68,0.1); color: #f87171;
      border: 1px solid rgba(239,68,68,0.2); padding: 0.4rem 1rem;
      border-radius: 8px; font-size: 0.85rem; cursor: pointer; }
    .logout-btn:hover { background: rgba(239,68,68,0.2); }
    .content { flex: 1; padding: 2rem; max-width: 1200px; width: 100%; margin: 0 auto; }
  `]
})
export class AdminShellComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  logout() { this.auth.logout(); }
}