import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Admin Dashboard</h1>
        <p class="page-sub">System overview and management</p>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10
                   0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3
                   3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0
                   0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <p class="stat-label">Total Users</p>
            <p class="stat-value">{{ stats()?.totalUsers ?? 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon personal">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div>
            <p class="stat-label">Personal Users</p>
            <p class="stat-value blue">{{ stats()?.personalUsers ?? 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon business">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14
                   0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1
                   4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0
                   011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div>
            <p class="stat-label">Business Users</p>
            <p class="stat-value purple">{{ stats()?.businessUsers ?? 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon pending">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round"
                stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="stat-label">Pending Loans</p>
            <p class="stat-value yellow">{{ stats()?.pendingLoans ?? 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="section-title">Management</div>
      <div class="actions-grid">
        <a routerLink="/admin/users" class="action-card">
          <div class="action-icon">👥</div>
          <span class="action-label">Manage Users</span>
          <span class="action-sub">View, enable/disable accounts</span>
        </a>
        <a routerLink="/admin/loans" class="action-card">
          <div class="action-icon">💰</div>
          <span class="action-label">Manage Loans</span>
          <span class="action-sub">Approve or reject applications</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .page { font-family: 'Segoe UI', sans-serif; color: #e2e8f0; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
    .page-sub { color: #64748b; font-size: 0.875rem; margin-top: 0.25rem; }

    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; padding: 1.5rem;
      display: flex; align-items: center; gap: 1rem; }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .stat-icon.total    { background: rgba(100,116,139,0.15); color: #94a3b8; }
    .stat-icon.personal { background: rgba(59,130,246,0.15);  color: #60a5fa; }
    .stat-icon.business { background: rgba(124,58,237,0.15);  color: #a78bfa; }
    .stat-label { color: #64748b; font-size: 0.8rem; margin-bottom: 0.25rem; }
    .stat-value { font-size: 1.75rem; font-weight: 700; color: #f1f5f9; }
    .stat-value.blue   { color: #60a5fa; }
    .stat-value.purple { color: #a78bfa; }
    .stat-icon.pending { background: rgba(251,191,36,0.15); color: #fbbf24; }
    .stat-value.yellow { color: #fbbf24; }
    .stats-grid { grid-template-columns: repeat(4, 1fr); }

    .section-title { color: #94a3b8; font-size: 0.8rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 1rem; }

    .actions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .action-card { background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; padding: 1.5rem; text-decoration: none;
      transition: all 0.2s; display: flex; flex-direction: column; gap: 0.5rem; }
    .action-card:hover { background: rgba(255,255,255,0.07);
      border-color: rgba(255,255,255,0.15); transform: translateY(-2px); }
    .action-icon { font-size: 1.75rem; }
    .action-label { color: #f1f5f9; font-size: 0.95rem; font-weight: 600; }
    .action-sub { color: #64748b; font-size: 0.8rem; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  stats = signal<any>(null);

  ngOnInit() {
    this.http.get<any>('http://localhost:8080/api/admin/stats').subscribe({
      next: (res) => this.stats.set(res.data),
      error: (err) => console.error(err)
    });
  }
}