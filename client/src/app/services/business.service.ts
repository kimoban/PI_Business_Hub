import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface Business {
  id: number;
  name: string;
  logoUrl?: string;
  industry?: string;
  phone?: string;
  email?: string;
  currency?: string;
  timezone?: string;
  subscriptionStatus?: string;
  createdAt?: string;
}

export interface Profile {
  id: number;
  userId: string;
  businessId?: number;
  role: string;
  business?: Business;
}

export interface CreateBusiness {
  name: string;
  industry?: string;
  phone?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private profileSubject = new BehaviorSubject<Profile | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  profile$ = this.profileSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  get currentProfile(): Profile | null {
    return this.profileSubject.value;
  }

  get currentBusiness(): Business | null {
    return this.profileSubject.value?.business || null;
  }

  getCurrentBusinessId(): number | null {
    return this.profileSubject.value?.businessId || null;
  }

  constructor(private http: HttpClient) {}

  loadProfile(): Observable<Profile> {
    this.loadingSubject.next(true);
    return this.http.get<Profile>('/api/profiles/me', { withCredentials: true })
      .pipe(
        tap(profile => {
          this.profileSubject.next(profile);
          this.loadingSubject.next(false);
        })
      );
  }

  createBusiness(data: CreateBusiness): Observable<Business> {
    return this.http.post<Business>('/api/businesses', data, { withCredentials: true })
      .pipe(tap(() => this.loadProfile().subscribe()));
  }

  updateBusiness(id: number, data: Partial<CreateBusiness>): Observable<Business> {
    return this.http.patch<Business>(`/api/businesses/${id}`, data, { withCredentials: true })
      .pipe(tap(() => this.loadProfile().subscribe()));
  }

  getBusiness(id: number): Observable<Business> {
    return this.http.get<Business>(`/api/businesses/${id}`, { withCredentials: true });
  }
}
