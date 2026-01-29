import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, interval, switchMap, startWith } from 'rxjs';

export interface AppNotification {
  id: number;
  userId: string;
  businessId?: number | null;
  type: 'reminder' | 'task_assigned' | 'task_completed' | 'customer_added' | 'form_submitted' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);

  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Poll for new notifications every 30 seconds
  startPolling(): void {
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.fetchNotifications())
    ).subscribe();
  }

  private fetchNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>('/api/me/notifications')
      .pipe(
        tap(notifications => {
          this.notificationsSubject.next(notifications);
          this.unreadCountSubject.next(notifications.filter(n => !n.isRead).length);
        })
      );
  }

  loadNotifications(): void {
    this.loadingSubject.next(true);
    this.http.get<AppNotification[]>('/api/me/notifications')
      .subscribe({
        next: (notifications) => {
          this.notificationsSubject.next(notifications);
          this.unreadCountSubject.next(notifications.filter(n => !n.isRead).length);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        }
      });
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>('/api/me/notifications/unread-count')
      .pipe(
        tap(({ count }) => this.unreadCountSubject.next(count))
      );
  }

  markAsRead(id: number): Observable<AppNotification> {
    return this.http.post<AppNotification>(`/api/notifications/${id}/read`, {})
      .pipe(
        tap(updated => {
          const current = this.notificationsSubject.value;
          const index = current.findIndex(n => n.id === id);
          if (index !== -1) {
            current[index] = updated;
            this.notificationsSubject.next([...current]);
            this.unreadCountSubject.next(current.filter(n => !n.isRead).length);
          }
        })
      );
  }

  markAllAsRead(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>('/api/me/notifications/mark-all-read', {})
      .pipe(
        tap(() => {
          const current = this.notificationsSubject.value.map(n => ({ ...n, isRead: true }));
          this.notificationsSubject.next(current);
          this.unreadCountSubject.next(0);
        })
      );
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`/api/notifications/${id}`)
      .pipe(
        tap(() => {
          const current = this.notificationsSubject.value;
          const notification = current.find(n => n.id === id);
          const wasUnread = notification && !notification.isRead;
          this.notificationsSubject.next(current.filter(n => n.id !== id));
          if (wasUnread) {
            this.unreadCountSubject.next(this.unreadCountSubject.value - 1);
          }
        })
      );
  }

  // Helper to show browser notification if permission granted
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  showBrowserNotification(title: string, body: string, icon?: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
      });
    }
  }
}
