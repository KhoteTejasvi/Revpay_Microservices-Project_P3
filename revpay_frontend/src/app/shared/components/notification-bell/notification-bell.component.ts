import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService, NotificationItem } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-wrapper">

      <!-- Bell Button -->
      <button class="bell-btn" (click)="toggle()">
        🔔
        @if (notifService.unreadCount() > 0) {
          <span class="badge">
            {{ notifService.unreadCount() > 99 ? '99+' : notifService.unreadCount() }}
          </span>
        }
      </button>

      <!-- Dropdown -->
      @if (open()) {
        <div class="dropdown">
          <div class="dropdown-header">
            <span class="dropdown-title">Notifications</span>
            @if (notifService.unreadCount() > 0) {
              <button class="mark-all-btn" (click)="markAllRead()">
                Mark all read
              </button>
            }
          </div>

          @if (loading()) {
            <div class="notif-empty">Loading...</div>
          } @else if (!items().length) {
            <div class="notif-empty">No notifications yet</div>
          } @else {
            <div class="notif-list">
              @for (n of items(); track n.id) {
                <div class="notif-item"
                  [class.unread]="!n.read"
                  (click)="handleClick(n)">
                  <div class="notif-icon">{{ getIcon(n.type) }}</div>
                  <div class="notif-content">
                    <p class="notif-title">{{ n.title }}</p>
                    <p class="notif-body">{{ n.body }}</p>
                    <p class="notif-time">
                      {{ n.createdAt | date:'dd MMM, hh:mm a' }}
                    </p>
                  </div>
                  @if (!n.read) {
                    <div class="unread-dot"></div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Backdrop to close on outside click -->
        <div class="backdrop" (click)="open.set(false)"></div>
      }
    </div>
  `,
  styles: [`
    .notif-wrapper { position: relative; }

    .bell-btn {
      background: none;
      border: none;
      font-size: 1.3rem;
      cursor: pointer;
      position: relative;
      padding: 4px 8px;
      border-radius: 8px;
      transition: background 0.2s;
    }
    .bell-btn:hover { background: rgba(255,255,255,0.08); }

    .badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ef4444;
      color: white;
      font-size: 0.6rem;
      font-weight: 700;
      min-width: 16px;
      height: 16px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 98;
    }

    .dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      width: 360px;
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      z-index: 99;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      overflow: hidden;
    }

    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem 0.75rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .dropdown-title {
      color: #f1f5f9;
      font-weight: 700;
      font-size: 0.95rem;
    }
    .mark-all-btn {
      background: none;
      border: none;
      color: #60a5fa;
      font-size: 0.78rem;
      cursor: pointer;
      padding: 0;
    }
    .mark-all-btn:hover { text-decoration: underline; }

    .notif-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.9rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      cursor: pointer;
      transition: background 0.15s;
      position: relative;
    }
    .notif-item:hover { background: rgba(255,255,255,0.04); }
    .notif-item.unread { background: rgba(59,130,246,0.05); }
    .notif-item:last-child { border-bottom: none; }

    .notif-icon {
      font-size: 1.2rem;
      margin-top: 2px;
      flex-shrink: 0;
    }

    .notif-content { flex: 1; }
    .notif-title {
      color: #f1f5f9;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .notif-body {
      color: #94a3b8;
      font-size: 0.8rem;
      line-height: 1.4;
      margin-bottom: 4px;
    }
    .notif-time {
      color: #475569;
      font-size: 0.72rem;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #3b82f6;
      flex-shrink: 0;
      margin-top: 4px;
    }

    .notif-empty {
      padding: 2.5rem;
      text-align: center;
      color: #475569;
      font-size: 0.875rem;
    }
  `]
})
export class NotificationBellComponent implements OnInit {
  notifService = inject(NotificationService);
  private router = inject(Router);

  open = signal(false);
  loading = signal(false);
  items = signal<NotificationItem[]>([]);

  ngOnInit() {
    // Load unread count on component init
    this.notifService.loadUnreadCount();

    // Refresh count every 30 seconds
    setInterval(() => {
      this.notifService.loadUnreadCount();
    }, 30000);
  }

  toggle() {
    if (!this.open()) {
      this.loadNotifications();
    }
    this.open.update(v => !v);
  }

  loadNotifications() {
    this.loading.set(true);
    this.notifService.loadNotifications().subscribe({
      next: (res) => {
        this.items.set(res.data?.content ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  markAllRead() {
    this.notifService.markAllAsRead().subscribe({
      next: () => {
        // Update all items locally as read
        this.items.update(list => list.map(n => ({ ...n, read: true })));
        this.notifService.unreadCount.set(0);
      }
    });
  }

  handleClick(n: NotificationItem) {
    if (!n.read) {
      this.notifService.markAsRead(n.id).subscribe({
        next: () => {
          this.items.update(list =>
            list.map(item => item.id === n.id ? { ...item, read: true } : item)
          );
          this.notifService.unreadCount.update(c => Math.max(0, c - 1));
        }
      });
    }
    if (n.actionUrl) {
      this.open.set(false);
      this.router.navigate([this.resolveRoute(n)]);
    }
  }

  private resolveRoute(n: NotificationItem): string {
    // Detect if user is personal or business from current URL
    const isBusiness = this.router.url.includes('/business/');
    const prefix = isBusiness ? '/business' : '/personal';

    // Map notification types to correct Angular routes
    switch (n.type) {
      case 'TRANSACTION_ALERT':
      case 'ACCOUNT_ALERT':
        return `${prefix}/transactions`;

      case 'INVOICE_RECEIVED':
      case 'INVOICE_PAID':
        return `${prefix}/invoices`;

      case 'MONEY_REQUEST':
        return `${prefix}/request`;

      case 'LOAN_STATUS_UPDATE':
      case 'EMI_REMINDER':
      case 'EMI_DUE':
        return `${prefix}/loans`;

      default:
        return `${prefix}/dashboard`;
    }
  }

//   handleClick(n: NotificationItem) {
//     // Mark as read
//     if (!n.read) {
//       this.notifService.markAsRead(n.id).subscribe({
//         next: () => {
//           this.items.update(list =>
//             list.map(item => item.id === n.id ? { ...item, read: true } : item)
//           );
//           this.notifService.unreadCount.update(c => Math.max(0, c - 1));
//         }
//       });
//     }
//     // Navigate if actionUrl exists
//     if (n.actionUrl) {
//       this.open.set(false);
//       this.router.navigate([n.actionUrl]);
//     }
//   }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'TRANSACTION_ALERT': '💸',
      'ACCOUNT_ALERT': '⚠️',
      'INVOICE_RECEIVED': '📄',
      'INVOICE_PAID': '✅',
      'MONEY_REQUEST': '🤝',
      'LOAN_STATUS_UPDATE': '🏦',
      'EMI_REMINDER': '📅',
      'EMI_DUE': '⏰',
      'SYSTEM': '🔔',
    };
    return icons[type] ?? '🔔';
  }
}