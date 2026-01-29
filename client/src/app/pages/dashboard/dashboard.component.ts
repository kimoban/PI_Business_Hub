import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLayoutComponent } from '../../components/app-layout/app-layout.component';
import { AuthService } from '../../services/auth.service';
import { BusinessService, Profile } from '../../services/business.service';
import { TaskService, Task } from '../../services/task.service';
import { CustomerService, Customer } from '../../services/customer.service';
import { FormService, Form } from '../../services/form.service';
import { ReminderService, Reminder } from '../../services/reminder.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AppLayoutComponent],
  template: `
    <app-layout>
      <div class="space-y-8">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-bold text-gray-900">
              Welcome back, {{ authService.currentUser?.firstName || 'User' }}
            </h2>
            <p class="text-gray-500 mt-1">
              Here's what's happening with your business today.
            </p>
          </div>
          <div class="text-right text-sm text-gray-500">
            {{ currentDate | date:'EEEE, MMMM d, yyyy' }}
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-gray-900">{{ activeTasks }}</p>
                <p class="text-xs text-gray-500">Active Tasks</p>
              </div>
            </div>
            <div class="mt-4 flex items-center text-sm">
              <span class="text-green-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ completedTasks }}
              </span>
              <span class="text-gray-400 ml-2">completed</span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-gray-900">{{ totalCustomers }}</p>
                <p class="text-xs text-gray-500">Customers</p>
              </div>
            </div>
            <div class="mt-4 flex items-center text-sm">
              <span class="text-green-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
                {{ newCustomersThisWeek }}
              </span>
              <span class="text-gray-400 ml-2">this week</span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-gray-900">{{ totalForms }}</p>
                <p class="text-xs text-gray-500">Active Forms</p>
              </div>
            </div>
            <div class="mt-4 flex items-center text-sm text-gray-400">
              Data collection enabled
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-gray-900">{{ upcomingReminders }}</p>
                <p class="text-xs text-gray-500">Reminders</p>
              </div>
            </div>
            <div class="mt-4 flex items-center text-sm">
              @if (overdueReminders > 0) {
                <span class="text-red-600 flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  {{ overdueReminders }}
                </span>
                <span class="text-gray-400 ml-2">overdue</span>
              } @else {
                <span class="text-green-600">All caught up!</span>
              }
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid lg:grid-cols-2 gap-8">
          <!-- Task Status Chart -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Task Overview</h3>
            <div class="flex items-center gap-8">
              <!-- Donut Chart -->
              <div class="relative w-40 h-40">
                <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                  <!-- Background circle -->
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="12"/>
                  <!-- Todo segment -->
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#fbbf24" stroke-width="12"
                          [attr.stroke-dasharray]="todoPercent + ' ' + (100 - todoPercent)"
                          stroke-dashoffset="0"/>
                  <!-- In Progress segment -->
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" stroke-width="12"
                          [attr.stroke-dasharray]="inProgressPercent + ' ' + (100 - inProgressPercent)"
                          [attr.stroke-dashoffset]="-todoPercent"/>
                  <!-- Done segment -->
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" stroke-width="12"
                          [attr.stroke-dasharray]="donePercent + ' ' + (100 - donePercent)"
                          [attr.stroke-dashoffset]="-(todoPercent + inProgressPercent)"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">{{ tasks.length }}</p>
                    <p class="text-xs text-gray-500">Total</p>
                  </div>
                </div>
              </div>
              <!-- Legend -->
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span class="text-sm text-gray-600">To Do ({{ todoCount }})</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span class="text-sm text-gray-600">In Progress ({{ inProgressCount }})</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-gray-600">Done ({{ completedTasks }})</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Task Priority Distribution -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">High Priority</span>
                  <span class="font-medium text-red-600">{{ highPriorityCount }}</span>
                </div>
                <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-red-500 rounded-full transition-all duration-300"
                       [style.width.%]="tasks.length ? (highPriorityCount / tasks.length) * 100 : 0"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">Medium Priority</span>
                  <span class="font-medium text-yellow-600">{{ mediumPriorityCount }}</span>
                </div>
                <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-yellow-500 rounded-full transition-all duration-300"
                       [style.width.%]="tasks.length ? (mediumPriorityCount / tasks.length) * 100 : 0"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">Low Priority</span>
                  <span class="font-medium text-gray-600">{{ lowPriorityCount }}</span>
                </div>
                <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-gray-400 rounded-full transition-all duration-300"
                       [style.width.%]="tasks.length ? (lowPriorityCount / tasks.length) * 100 : 0"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Weekly Activity -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
          <div class="flex items-end gap-2 h-40">
            @for (day of weeklyActivity; track day.label) {
              <div class="flex-1 flex flex-col items-center gap-2">
                <div class="w-full bg-gray-100 rounded-t-lg relative" style="height: 120px;">
                  <div class="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-lg transition-all duration-300"
                       [style.height.%]="day.percent"></div>
                </div>
                <span class="text-xs text-gray-500">{{ day.label }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="grid lg:grid-cols-2 gap-8">
          <!-- Recent Tasks -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Recent Tasks</h3>
              <a routerLink="/tasks" class="text-sm text-indigo-600 hover:text-indigo-700">View all</a>
            </div>
            <div class="p-6">
              @if (tasks.length === 0) {
                <div class="text-center py-8 text-gray-500">
                  No tasks yet. Create your first task!
                </div>
              } @else {
                @for (task of tasks.slice(0, 5); track task.id) {
                  <div class="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                    <div [ngClass]="{
                      'bg-yellow-100 text-yellow-700': task.status === 'todo',
                      'bg-blue-100 text-blue-700': task.status === 'in_progress',
                      'bg-green-100 text-green-700': task.status === 'done'
                    }" class="px-2 py-1 rounded text-xs font-medium">
                      {{ formatStatus(task.status) }}
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
                }
              }
            </div>
          </div>

          <!-- Recent Customers -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Recent Customers</h3>
              <a routerLink="/customers" class="text-sm text-indigo-600 hover:text-indigo-700">View all</a>
            </div>
            <div class="p-6">
              @if (customers.length === 0) {
                <div class="text-center py-8 text-gray-500">
                  No customers yet. Add your first customer!
                </div>
              } @else {
                @for (customer of customers.slice(0, 5); track customer.id) {
                  <div class="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span class="text-gray-600 font-medium">{{ customer.name[0] | uppercase }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ customer.name }}</p>
                      <p class="text-xs text-gray-500 truncate">{{ customer.email || 'No email' }}</p>
                    </div>
                  </div>
                }
              }
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
  private reminderService = inject(ReminderService);

  tasks: Task[] = [];
  customers: Customer[] = [];
  forms: Form[] = [];
  reminders: Reminder[] = [];

  currentDate = new Date();

  weeklyActivity = [
    { label: 'Mon', count: 0, percent: 0 },
    { label: 'Tue', count: 0, percent: 0 },
    { label: 'Wed', count: 0, percent: 0 },
    { label: 'Thu', count: 0, percent: 0 },
    { label: 'Fri', count: 0, percent: 0 },
    { label: 'Sat', count: 0, percent: 0 },
    { label: 'Sun', count: 0, percent: 0 },
  ];

  get activeTasks(): number {
    return this.tasks.filter(t => t.status !== 'done').length;
  }

  get completedTasks(): number {
    return this.tasks.filter(t => t.status === 'done').length;
  }

  get todoCount(): number {
    return this.tasks.filter(t => t.status === 'todo').length;
  }

  get inProgressCount(): number {
    return this.tasks.filter(t => t.status === 'in_progress').length;
  }

  get highPriorityCount(): number {
    return this.tasks.filter(t => t.priority === 'high').length;
  }

  get mediumPriorityCount(): number {
    return this.tasks.filter(t => t.priority === 'medium').length;
  }

  get lowPriorityCount(): number {
    return this.tasks.filter(t => t.priority === 'low').length;
  }

  get totalCustomers(): number {
    return this.customers.length;
  }

  get newCustomersThisWeek(): number {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return this.customers.filter(c => c.createdAt && new Date(c.createdAt) >= weekAgo).length;
  }

  get totalForms(): number {
    return this.forms.length;
  }

  get upcomingReminders(): number {
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);
    return this.reminders.filter(r => {
      const due = new Date(r.dueAt);
      return r.status === 'pending' && due >= now && due <= weekFromNow;
    }).length;
  }

  get overdueReminders(): number {
    const now = new Date();
    return this.reminders.filter(r => {
      const due = new Date(r.dueAt);
      return r.status === 'pending' && due < now;
    }).length;
  }

  // Chart calculations
  get todoPercent(): number {
    return this.tasks.length ? (this.todoCount / this.tasks.length) * 100 * 2.51 : 0;
  }

  get inProgressPercent(): number {
    return this.tasks.length ? (this.inProgressCount / this.tasks.length) * 100 * 2.51 : 0;
  }

  get donePercent(): number {
    return this.tasks.length ? (this.completedTasks / this.tasks.length) * 100 * 2.51 : 0;
  }

  ngOnInit() {
    this.businessService.loadProfile().subscribe(profile => {
      if (profile?.businessId) {
        this.loadData(profile.businessId);
      }
    });
  }

  private loadData(businessId: number) {
    this.taskService.loadTasks(businessId).subscribe(tasks => {
      this.tasks = tasks;
      this.calculateWeeklyActivity();
    });
    this.customerService.loadCustomers(businessId).subscribe(customers => this.customers = customers);
    this.formService.loadForms(businessId).subscribe(forms => this.forms = forms);

    this.reminderService.reminders$.subscribe(reminders => this.reminders = reminders);
    this.reminderService.loadReminders();
  }

  private calculateWeeklyActivity() {
    // Reset counts
    this.weeklyActivity.forEach(d => d.count = 0);

    const today = new Date();
    const dayOfWeek = today.getDay();

    // Count tasks created in the last 7 days
    this.tasks.forEach(task => {
      if (task.createdAt) {
        const taskDate = new Date(task.createdAt);
        const daysAgo = Math.floor((today.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo < 7) {
          const taskDayIndex = (taskDate.getDay() + 6) % 7; // Convert to Monday = 0
          this.weeklyActivity[taskDayIndex].count++;
        }
      }
    });

    // Calculate percentages
    const maxCount = Math.max(...this.weeklyActivity.map(d => d.count), 1);
    this.weeklyActivity.forEach(d => {
      d.percent = (d.count / maxCount) * 100;
    });
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'todo': return 'To Do';
      case 'in_progress': return 'In Progress';
      case 'done': return 'Done';
      default: return status;
    }
  }
}
