import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface Customer {
  id: number;
  businessId: number;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  createdAt?: string;
}

export interface CreateCustomer {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customersSubject = new BehaviorSubject<Customer[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  customers$ = this.customersSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadCustomers(businessId: number): Observable<Customer[]> {
    this.loadingSubject.next(true);
    return this.http.get<Customer[]>(`/api/businesses/${businessId}/customers`, { withCredentials: true })
      .pipe(
        tap(customers => {
          this.customersSubject.next(customers);
          this.loadingSubject.next(false);
        })
      );
  }

  createCustomer(businessId: number, data: CreateCustomer): Observable<Customer> {
    return this.http.post<Customer>(`/api/businesses/${businessId}/customers`, data, { withCredentials: true })
      .pipe(tap(() => this.loadCustomers(businessId).subscribe()));
  }

  updateCustomer(businessId: number, customerId: number, data: Partial<CreateCustomer>): Observable<Customer> {
    return this.http.patch<Customer>(`/api/businesses/${businessId}/customers/${customerId}`, data, { withCredentials: true })
      .pipe(tap(() => this.loadCustomers(businessId).subscribe()));
  }

  deleteCustomer(businessId: number, customerId: number): Observable<void> {
    return this.http.delete<void>(`/api/businesses/${businessId}/customers/${customerId}`, { withCredentials: true })
      .pipe(tap(() => this.loadCustomers(businessId).subscribe()));
  }
}
