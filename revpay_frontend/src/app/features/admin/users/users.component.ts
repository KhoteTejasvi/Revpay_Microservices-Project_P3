import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: `./users.component.html`,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .page { font-family: 'Segoe UI', sans-serif; color: #e2e8f0; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
    .page-sub { color: #64748b; font-size: 0.875rem; margin-top: 0.25rem; }

    .table-wrap { background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; }

    .table-header { display: grid;
      grid-template-columns: 2fr 1fr 1.5fr 1fr 1fr 1fr 0.8fr;
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      color: #475569; font-size: 0.75rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px; }

    .table-row { display: grid;
      grid-template-columns: 2fr 1fr 1.5fr 1fr 1fr 1fr 0.8fr;
      padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.04);
      align-items: center; transition: background 0.15s; }
    .table-row:last-child { border-bottom: none; }
    .table-row:hover { background: rgba(255,255,255,0.03); }

    .user-name { color: #f1f5f9; font-size: 0.875rem; font-weight: 500; }
    .user-email { color: #64748b; font-size: 0.78rem; margin-top: 2px; }

    .role-badge { display: inline-block; padding: 0.2rem 0.6rem;
      border-radius: 999px; font-size: 0.72rem; font-weight: 500; }
    .role-personal { background: rgba(59,130,246,0.15); color: #60a5fa; }
    .role-business  { background: rgba(124,58,237,0.15); color: #a78bfa; }
    .role-admin     { background: rgba(239,68,68,0.15);  color: #f87171; }

    .account-num { color: #64748b; font-size: 0.78rem; font-family: monospace; }
    .balance { color: #4ade80; font-size: 0.875rem; font-weight: 600; }
    .date { color: #64748b; font-size: 0.8rem; }

    .status-dot { font-size: 0.78rem; font-weight: 500; }
    .status-dot.active   { color: #4ade80; }
    .status-dot.inactive { color: #f87171; }

    .toggle-btn { padding: 0.3rem 0.75rem; border-radius: 7px;
      cursor: pointer; font-size: 0.78rem; font-weight: 500; border: 1px solid; }
    .toggle-btn.disable { background: rgba(239,68,68,0.1); color: #f87171;
      border-color: rgba(239,68,68,0.2); }
    .toggle-btn.enable  { background: rgba(34,197,94,0.1); color: #4ade80;
      border-color: rgba(34,197,94,0.2); }
    .toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .empty { padding: 3rem; text-align: center; color: #475569; }

    .pagination { display: flex; align-items: center; justify-content: center;
      gap: 1rem; margin-top: 1.5rem; }
    .page-btn { background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: #94a3b8; padding: 0.5rem 1rem; border-radius: 8px;
      cursor: pointer; font-size: 0.875rem; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-info { color: #64748b; font-size: 0.875rem; }
  `]
})
export class AdminUsersComponent implements OnInit {
  private http = inject(HttpClient);

  users = signal<any[]>([]);
  loading = signal(true);
  currentPage = signal(0);
  hasNext = signal(false);
  totalUsers = signal(0);
  togglingId = signal<number | null>(null);

  ngOnInit() { this.loadPage(0); }

  loadPage(page: number) {
    this.loading.set(true);
    this.http.get<any>(
      `http://localhost:8080/api/admin/users?page=${page}&size=20`
    ).subscribe({
      next: (res) => {
        this.users.set(res.data.content);
        this.totalUsers.set(res.data.totalElements);
        this.hasNext.set(!res.data.last);
        this.currentPage.set(page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleUser(id: number) {
    this.togglingId.set(id);
    this.http.post<any>(
      `http://localhost:8080/api/admin/users/${id}/toggle`, {}
    ).subscribe({
      next: (res) => {
        this.togglingId.set(null);
        this.users.update(list =>
          list.map(u => u.id === id ? res.data : u)
        );
      },
      error: () => this.togglingId.set(null)
    });
  }
}