import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  body: string;
  read: boolean;
  actionUrl: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/notifications`;

  unreadCount = signal<number>(0);
  notifications = signal<NotificationItem[]>([]);

  // Load all notifications
  loadNotifications(page = 0, size = 20) {
    return this.http.get<any>(`${this.base}?page=${page}&size=${size}`);
  }

  // Get unread count (for bell badge)
  loadUnreadCount() {
    this.http.get<any>(`${this.base}/unread-count`).subscribe({
      next: (res) => this.unreadCount.set(res.data ?? 0),
      error: () => this.unreadCount.set(0)
    });
  }

  // Mark single as read
  markAsRead(id: number) {
    return this.http.post<any>(`${this.base}/${id}/read`, {});
  }

  // Mark all as read
  markAllAsRead() {
    return this.http.post<any>(`${this.base}/read-all`, {});
  }

  // Delete
  delete(id: number) {
    return this.http.delete<any>(`${this.base}/${id}`);
  }
}