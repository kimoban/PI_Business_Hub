import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface Task {
  id: number;
  businessId: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string;
  assignee?: { id: string; firstName?: string; lastName?: string };
  dueDate?: string;
  createdAt?: string;
}

export interface CreateTask {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assigneeId?: string;
  dueDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  tasks$ = this.tasksSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadTasks(businessId: number): Observable<Task[]> {
    this.loadingSubject.next(true);
    return this.http.get<Task[]>(`/api/businesses/${businessId}/tasks`, { withCredentials: true })
      .pipe(
        tap(tasks => {
          this.tasksSubject.next(tasks);
          this.loadingSubject.next(false);
        })
      );
  }

  createTask(businessId: number, data: CreateTask): Observable<Task> {
    return this.http.post<Task>(`/api/businesses/${businessId}/tasks`, data, { withCredentials: true })
      .pipe(tap(() => this.loadTasks(businessId).subscribe()));
  }

  updateTask(businessId: number, taskId: number, data: Partial<CreateTask>): Observable<Task> {
    return this.http.patch<Task>(`/api/businesses/${businessId}/tasks/${taskId}`, data, { withCredentials: true })
      .pipe(tap(() => this.loadTasks(businessId).subscribe()));
  }

  deleteTask(businessId: number, taskId: number): Observable<void> {
    return this.http.delete<void>(`/api/businesses/${businessId}/tasks/${taskId}`, { withCredentials: true })
      .pipe(tap(() => this.loadTasks(businessId).subscribe()));
  }
}
