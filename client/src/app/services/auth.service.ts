import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';

export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(true);

  user$ = this.userSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  get isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  constructor(private http: HttpClient) {
    this.checkAuth();
  }

  checkAuth(): void {
    this.loadingSubject.next(true);
    this.http.get<User>('/api/auth/user', { withCredentials: true })
      .pipe(
        tap(user => {
          this.userSubject.next(user);
          this.loadingSubject.next(false);
        }),
        catchError(err => {
          this.userSubject.next(null);
          this.loadingSubject.next(false);
          return of(null);
        })
      )
      .subscribe();
  }

  login(): void {
    window.location.href = '/api/login';
  }

  logout(): void {
    window.location.href = '/api/logout';
  }
}
