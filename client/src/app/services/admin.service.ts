import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { User } from './auth.service';

export interface UserWithProfile {
  id: number;
  userId: string;
  businessId: number;
  role: 'admin' | 'staff' | 'guest' | 'client';
  user: User;
}

export interface UserPermissions {
  role: string;
  permissions: string[];
  businessId: number | null;
}

export interface BusinessAnalytics {
  totalTasks: number;
  tasksByStatus: {
    todo: number;
    in_progress: number;
    done: number;
  };
  tasksByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  totalCustomers: number;
  newCustomersLast30Days: number;
  totalForms: number;
  totalReminders: number;
  pendingReminders: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

  private usersSubject = new BehaviorSubject<UserWithProfile[]>([]);
  users$ = this.usersSubject.asObservable();

  private permissionsSubject = new BehaviorSubject<UserPermissions | null>(null);
  permissions$ = this.permissionsSubject.asObservable();

  private analyticsSubject = new BehaviorSubject<BusinessAnalytics | null>(null);
  analytics$ = this.analyticsSubject.asObservable();

  loadPermissions(): Observable<UserPermissions> {
    return this.http.get<UserPermissions>('/api/auth/permissions').pipe(
      tap(permissions => this.permissionsSubject.next(permissions)),
      catchError(err => {
        console.error('Failed to load permissions', err);
        return of({ role: 'guest', permissions: [], businessId: null });
      })
    );
  }

  isAdmin(): boolean {
    return this.permissionsSubject.value?.role === 'admin';
  }

  hasPermission(permission: string): boolean {
    return this.permissionsSubject.value?.permissions.includes(permission) ?? false;
  }

  loadUsers(): Observable<UserWithProfile[]> {
    return this.http.get<UserWithProfile[]>('/api/admin/users').pipe(
      tap(users => this.usersSubject.next(users)),
      catchError(err => {
        console.error('Failed to load users', err);
        return of([]);
      })
    );
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`/api/admin/users/${userId}/role`, { role }).pipe(
      tap(() => {
        // Refresh users list after update
        this.loadUsers().subscribe();
      })
    );
  }

  loadAnalytics(): Observable<BusinessAnalytics> {
    return this.http.get<BusinessAnalytics>('/api/admin/analytics').pipe(
      tap(analytics => this.analyticsSubject.next(analytics)),
      catchError(err => {
        console.error('Failed to load analytics', err);
        return of({
          totalTasks: 0,
          tasksByStatus: { todo: 0, in_progress: 0, done: 0 },
          tasksByPriority: { high: 0, medium: 0, low: 0 },
          totalCustomers: 0,
          newCustomersLast30Days: 0,
          totalForms: 0,
          totalReminders: 0,
          pendingReminders: 0
        });
      })
    );
  }

  inviteUser(email: string, role: string): Observable<any> {
    return this.http.post('/api/admin/invite', { email, role });
  }
}
