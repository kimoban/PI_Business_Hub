import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLayoutComponent } from '../../components/app-layout/app-layout.component';
import { AuthService } from '../../services/auth.service';
import { BusinessService, Profile } from '../../services/business.service';
import { TaskService, Task } from '../../services/task.service';
import { CustomerService, Customer } from '../../services/customer.service';
import { FormService, Form } from '../../services/form.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AppLayoutComponent],
  template: `
    <app-layout>
      <div class="space-y-8">
        <!-- Header -->
        <div>
          <h2 class="text-3xl font-bold text-gray-900">
            Welcome back, {{ authService.currentUser?.firstName || 'User' }}
          </h2>
          <p class="text-gray-500 mt-1">
            Here's what's happening with your business today.
          </p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">Active Tasks</p>
                <p class="text-2xl font-bold text-gray-900">{{ activeTasks }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">Total Customers</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalCustomers }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">Active Forms</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalForms }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="grid lg:grid-cols-2 gap-8">
          <!-- Recent Tasks -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="p-6 border-b border-gray-100">
              <h3 class="text-lg font-semibold text-gray-900">Recent Tasks</h3>
            </div>
            <div class="p-6">
              <div *ngIf="tasks.length === 0" class="text-center py-8 text-gray-500">
                No tasks yet. Create your first task!
              </div>
              <div *ngFor="let task of tasks.slice(0, 5)" class="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <div [ngClass]="{
                  'bg-yellow-100 text-yellow-700': task.status === 'todo',
                  'bg-blue-100 text-blue-700': task.status === 'in_progress',
                  'bg-green-100 text-green-700': task.status === 'done'
                }" class="px-2 py-1 rounded text-xs font-medium">
                  {{ task.status | titlecase }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ task.title }}</p>
                </div>
                <div [ngClass]="{
                  'text-red-600': task.priority === 'high',
                  'text-yellow-600': task.priority === 'medium',
                  'text-gray-400': task.priority === 'low'
                }" class="text-xs font-medium">
                  {{ task.priority | titlecase }}
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Customers -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="p-6 border-b border-gray-100">
              <h3 class="text-lg font-semibold text-gray-900">Recent Customers</h3>
            </div>
            <div class="p-6">
              <div *ngIf="customers.length === 0" class="text-center py-8 text-gray-500">
                No customers yet. Add your first customer!
              </div>
              <div *ngFor="let customer of customers.slice(0, 5)" class="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span class="text-gray-600 font-medium">{{ customer.name[0] | uppercase }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ customer.name }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ customer.email || 'No email' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private businessService = inject(BusinessService);
  private taskService = inject(TaskService);
  private customerService = inject(CustomerService);
  private formService = inject(FormService);

  tasks: Task[] = [];
  customers: Customer[] = [];
  forms: Form[] = [];

  get activeTasks(): number {
    return this.tasks.filter(t => t.status !== 'done').length;
  }

  get totalCustomers(): number {
    return this.customers.length;
  }

  get totalForms(): number {
    return this.forms.length;
  }

  ngOnInit() {
    this.businessService.loadProfile().subscribe(profile => {
      if (profile?.businessId) {
        this.loadData(profile.businessId);
      }
    });
  }

  private loadData(businessId: number) {
    this.taskService.loadTasks(businessId).subscribe(tasks => this.tasks = tasks);
    this.customerService.loadCustomers(businessId).subscribe(customers => this.customers = customers);
    this.formService.loadForms(businessId).subscribe(forms => this.forms = forms);
  }
}
