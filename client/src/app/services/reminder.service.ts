import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { BusinessService } from './business.service';

export interface Reminder {
  id: number;
  businessId: number;
  taskId?: number | null;
  customerId?: number | null;
  title: string;
  description?: string | null;
  type: 'task' | 'follow_up' | 'meeting' | 'deadline' | 'custom';
  status: 'pending' | 'completed' | 'snoozed' | 'dismissed';
  dueAt: string;
  isRecurring: boolean;
  recurringPattern?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  task?: {
    id: number;
    title: string;
    status: string;
  } | null;
  customer?: {
    id: number;
    name: string;
    email?: string;
  } | null;
}

export interface CreateReminderInput {
  title: string;
  description?: string;
  type: Reminder['type'];
  taskId?: number;
  customerId?: number;
  dueAt: string;
  isRecurring?: boolean;
  recurringPattern?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private http = inject(HttpClient);
  private businessService = inject(BusinessService);

  private remindersSubject = new BehaviorSubject<Reminder[]>([]);
  public reminders$ = this.remindersSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  loadReminders(): void {
    const businessId = this.businessService.getCurrentBusinessId();
    if (!businessId) return;

    this.loadingSubject.next(true);
    this.http.get<Reminder[]>(`/api/businesses/${businessId}/reminders`)
      .subscribe({
        next: (reminders) => {
          this.remindersSubject.next(reminders);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        }
      });
  }

  getReminders(): Observable<Reminder[]> {
    return this.reminders$;
  }

  getUpcomingReminders(days: number = 7): Observable<Reminder[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return this.reminders$.pipe(
      map(reminders => reminders.filter(r => {
        const dueDate = new Date(r.dueAt);
        return r.status === 'pending' && dueDate >= now && dueDate <= futureDate;
      }))
    );
  }

  getOverdueReminders(): Observable<Reminder[]> {
    const now = new Date();
    return this.reminders$.pipe(
      map(reminders => reminders.filter(r => {
        const dueDate = new Date(r.dueAt);
        return r.status === 'pending' && dueDate < now;
      }))
    );
  }

  createReminder(input: CreateReminderInput): Observable<Reminder> {
    const businessId = this.businessService.getCurrentBusinessId();
    return this.http.post<Reminder>(`/api/businesses/${businessId}/reminders`, input)
      .pipe(
        tap(newReminder => {
          const current = this.remindersSubject.value;
          this.remindersSubject.next([newReminder, ...current]);
        })
      );
  }

  updateReminder(id: number, updates: Partial<CreateReminderInput>): Observable<Reminder> {
    return this.http.put<Reminder>(`/api/reminders/${id}`, updates)
      .pipe(
        tap(updated => {
          const current = this.remindersSubject.value;
          const index = current.findIndex(r => r.id === id);
          if (index !== -1) {
            current[index] = { ...current[index], ...updated };
            this.remindersSubject.next([...current]);
          }
        })
      );
  }

  completeReminder(id: number): Observable<Reminder> {
    return this.http.post<Reminder>(`/api/reminders/${id}/complete`, {})
      .pipe(
        tap(updated => {
          const current = this.remindersSubject.value;
          const index = current.findIndex(r => r.id === id);
          if (index !== -1) {
            current[index] = updated;
            this.remindersSubject.next([...current]);
          }
        })
      );
  }

  snoozeReminder(id: number, newDueAt: Date): Observable<Reminder> {
    return this.http.post<Reminder>(`/api/reminders/${id}/snooze`, {
      dueAt: newDueAt.toISOString()
    })
      .pipe(
        tap(updated => {
          const current = this.remindersSubject.value;
          const index = current.findIndex(r => r.id === id);
          if (index !== -1) {
            current[index] = updated;
            this.remindersSubject.next([...current]);
          }
        })
      );
  }

  deleteReminder(id: number): Observable<void> {
    return this.http.delete<void>(`/api/reminders/${id}`)
      .pipe(
        tap(() => {
          const current = this.remindersSubject.value;
          this.remindersSubject.next(current.filter(r => r.id !== id));
        })
      );
  }
}
