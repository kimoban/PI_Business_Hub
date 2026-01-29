import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface Form {
  id: number;
  businessId: number;
  title: string;
  description?: string;
  schema: any;
  createdAt?: string;
}

export interface FormSubmission {
  id: number;
  formId: number;
  data: any;
  submittedBy?: string;
  user?: { id: string; firstName?: string; lastName?: string };
  createdAt?: string;
}

export interface CreateForm {
  title: string;
  description?: string;
  schema?: any;
}

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private formsSubject = new BehaviorSubject<Form[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  forms$ = this.formsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadForms(businessId: number): Observable<Form[]> {
    this.loadingSubject.next(true);
    return this.http.get<Form[]>(`/api/businesses/${businessId}/forms`, { withCredentials: true })
      .pipe(
        tap(forms => {
          this.formsSubject.next(forms);
          this.loadingSubject.next(false);
        })
      );
  }

  createForm(businessId: number, data: CreateForm): Observable<Form> {
    const formData = {
      ...data,
      schema: data.schema || { fields: [{ name: 'notes', type: 'text' }] }
    };
    return this.http.post<Form>(`/api/businesses/${businessId}/forms`, formData, { withCredentials: true })
      .pipe(tap(() => this.loadForms(businessId).subscribe()));
  }

  getForm(formId: number): Observable<Form> {
    return this.http.get<Form>(`/api/forms/${formId}`, { withCredentials: true });
  }

  getSubmissions(formId: number): Observable<FormSubmission[]> {
    return this.http.get<FormSubmission[]>(`/api/forms/${formId}/submissions`, { withCredentials: true });
  }

  createSubmission(formId: number, data: any): Observable<FormSubmission> {
    return this.http.post<FormSubmission>(`/api/forms/${formId}/submissions`, { data }, { withCredentials: true });
  }

  updateForm(businessId: number, formId: number, data: Partial<CreateForm>): Observable<Form> {
    return this.http.put<Form>(`/api/forms/${formId}`, data, { withCredentials: true })
      .pipe(tap(() => this.loadForms(businessId).subscribe()));
  }

  deleteForm(businessId: number, formId: number): Observable<void> {
    return this.http.delete<void>(`/api/forms/${formId}`, { withCredentials: true })
      .pipe(tap(() => this.loadForms(businessId).subscribe()));
  }
}
