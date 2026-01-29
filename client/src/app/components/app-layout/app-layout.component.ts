import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BusinessService } from '../../services/business.service';
import { NotificationService, AppNotification } from '../../services/notification.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div class="p-6">
          <div class="flex items-center gap-2 mb-8">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
              </svg>
            </div>
            <span class="font-bold text-xl">WorkFlow</span>
          </div>

          <nav class="space-y-1">
            <a routerLink="/dashboard" routerLinkActive="bg-indigo-50 text-indigo-700"
               class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Dashboard
            </a>

            <a routerLink="/tasks" routerLinkActive="bg-indigo-50 text-indigo-700"
               class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
              Tasks
            </a>

            <a routerLink="/customers" routerLinkActive="bg-indigo-50 text-indigo-700"
               class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              Customers
            </a>

            <a routerLink="/forms" routerLinkActive="bg-indigo-50 text-indigo-700"
               class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Forms
            </a>

            <a routerLink="/reminders" routerLinkActive="bg-indigo-50 text-indigo-700"
               class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Reminders
            </a>

            <a routerLink="/admin" routerLinkActive="bg-indigo-50 text-indigo-700"
               class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              Admin
            </a>

            <a routerLink="/settings" routerLinkActive="bg-indigo-50 text-indigo-700"
               class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Settings
            </a>
          </nav>
        </div>

        <!-- User section -->
        <div class="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span class="text-indigo-700 font-medium">
                {{ (authService.currentUser?.firstName?.[0] || 'U') | uppercase }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ authService.currentUser?.firstName || 'User' }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                {{ authService.currentUser?.email || '' }}
              </p>
            </div>
            <button (click)="authService.logout()"
                    class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 ml-64">
        <!-- Top header bar -->
        <header class="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-end gap-4">
          <!-- Notification Bell -->
          <div class="relative">
            <button
              (click)="toggleNotifications()"
              class="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              @if (unreadCount() > 0) {
                <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {{ unreadCount() > 9 ? '9+' : unreadCount() }}
                </span>
              }
            </button>

            <!-- Notification dropdown -->
            @if (showNotifications()) {
              <div class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div class="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 class="font-semibold text-gray-900">Notifications</h3>
                  @if (unreadCount() > 0) {
                    <button
                      (click)="markAllAsRead()"
                      class="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Mark all read
                    </button>
                  }
                </div>
                <div class="max-h-96 overflow-y-auto">
                  @if (notifications().length === 0) {
                    <div class="p-4 text-center text-gray-500">
                      No notifications yet
                    </div>
                  } @else {
                    @for (notification of notifications().slice(0, 10); track notification.id) {
                      <div
                        class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        [class.bg-indigo-50]="!notification.isRead"
                        (click)="onNotificationClick(notification)"
                      >
                        <div class="flex items-start gap-3">
                          <div [class]="getNotificationIconClass(notification.type)">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              @switch (notification.type) {
                                @case ('reminder') {
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                }
                                @case ('task_assigned') {
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                }
                                @case ('task_completed') {
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                }
                                @default {
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                }
                              }
                            </svg>
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                            <p class="text-sm text-gray-500 truncate">{{ notification.message }}</p>
                            <p class="text-xs text-gray-400 mt-1">{{ formatNotificationTime(notification.createdAt) }}</p>
                          </div>
                        </div>
                      </div>
                    }
                  }
                </div>
              </div>
            }
          </div>
        </header>

        <!-- Page content -->
        <div class="p-8">
          <ng-content></ng-content>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class AppLayoutComponent implements OnInit {
  authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  notifications = signal<AppNotification[]>([]);
  unreadCount = signal(0);
  showNotifications = signal(false);

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications.set(notifications);
    });

    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount.set(count);
    });

    this.notificationService.loadNotifications();
  }

  toggleNotifications(): void {
    this.showNotifications.set(!this.showNotifications());
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }

  onNotificationClick(notification: AppNotification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
    if (notification.linkUrl) {
      window.location.href = notification.linkUrl;
    }
    this.showNotifications.set(false);
  }

  getNotificationIconClass(type: string): string {
    const base = 'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0';
    switch (type) {
      case 'reminder': return `${base} bg-amber-100 text-amber-600`;
      case 'task_assigned': return `${base} bg-blue-100 text-blue-600`;
      case 'task_completed': return `${base} bg-green-100 text-green-600`;
      case 'customer_added': return `${base} bg-purple-100 text-purple-600`;
      case 'form_submitted': return `${base} bg-indigo-100 text-indigo-600`;
      default: return `${base} bg-gray-100 text-gray-600`;
    }
  }

  formatNotificationTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }
}
