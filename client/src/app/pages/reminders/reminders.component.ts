import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReminderService, Reminder, CreateReminderInput } from '../../services/reminder.service';
import { TaskService } from '../../services/task.service';
import { CustomerService } from '../../services/customer.service';
import { BusinessService } from '../../services/business.service';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Reminders</h1>
          <p class="text-gray-500 mt-1">Stay on top of your tasks and follow-ups</p>
        </div>
        <button
          (click)="openCreateModal()"
          class="mt-4 sm:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          New Reminder
        </button>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex space-x-8">
          <button
            (click)="activeTab.set('upcoming')"
            [class.border-indigo-500]="activeTab() === 'upcoming'"
            [class.text-indigo-600]="activeTab() === 'upcoming'"
            [class.border-transparent]="activeTab() !== 'upcoming'"
            [class.text-gray-500]="activeTab() !== 'upcoming'"
            class="py-4 px-1 border-b-2 font-medium text-sm hover:text-gray-700 hover:border-gray-300"
          >
            Upcoming
            @if (upcomingCount() > 0) {
              <span class="ml-2 bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs">
                {{ upcomingCount() }}
              </span>
            }
          </button>
          <button
            (click)="activeTab.set('overdue')"
            [class.border-red-500]="activeTab() === 'overdue'"
            [class.text-red-600]="activeTab() === 'overdue'"
            [class.border-transparent]="activeTab() !== 'overdue'"
            [class.text-gray-500]="activeTab() !== 'overdue'"
            class="py-4 px-1 border-b-2 font-medium text-sm hover:text-gray-700 hover:border-gray-300"
          >
            Overdue
            @if (overdueCount() > 0) {
              <span class="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                {{ overdueCount() }}
              </span>
            }
          </button>
          <button
            (click)="activeTab.set('completed')"
            [class.border-green-500]="activeTab() === 'completed'"
            [class.text-green-600]="activeTab() === 'completed'"
            [class.border-transparent]="activeTab() !== 'completed'"
            [class.text-gray-500]="activeTab() !== 'completed'"
            class="py-4 px-1 border-b-2 font-medium text-sm hover:text-gray-700 hover:border-gray-300"
          >
            Completed
          </button>
          <button
            (click)="activeTab.set('all')"
            [class.border-gray-500]="activeTab() === 'all'"
            [class.text-gray-900]="activeTab() === 'all'"
            [class.border-transparent]="activeTab() !== 'all'"
            [class.text-gray-500]="activeTab() !== 'all'"
            class="py-4 px-1 border-b-2 font-medium text-sm hover:text-gray-700 hover:border-gray-300"
          >
            All
          </button>
        </nav>
      </div>

      <!-- Reminders List -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      } @else if (filteredReminders().length === 0) {
        <div class="text-center py-12 bg-gray-50 rounded-lg">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No reminders</h3>
          <p class="mt-1 text-sm text-gray-500">
            @switch (activeTab()) {
              @case ('upcoming') { No upcoming reminders in the next 7 days }
              @case ('overdue') { No overdue reminders - great job! }
              @case ('completed') { No completed reminders yet }
              @default { Get started by creating a new reminder }
            }
          </p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (reminder of filteredReminders(); track reminder.id) {
            <div
              class="bg-white border rounded-lg p-4 hover:shadow-md transition"
              [class.border-red-300]="isOverdue(reminder)"
              [class.bg-red-50]="isOverdue(reminder)"
              [class.border-green-300]="reminder.status === 'completed'"
              [class.bg-green-50]="reminder.status === 'completed'"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-4">
                  <!-- Status Checkbox -->
                  <button
                    (click)="toggleComplete(reminder)"
                    class="mt-1 flex-shrink-0"
                  >
                    @if (reminder.status === 'completed') {
                      <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    } @else {
                      <div class="w-6 h-6 border-2 border-gray-300 rounded-full hover:border-indigo-500"></div>
                    }
                  </button>

                  <div>
                    <h3
                      class="font-medium"
                      [class.line-through]="reminder.status === 'completed'"
                      [class.text-gray-500]="reminder.status === 'completed'"
                    >
                      {{ reminder.title }}
                    </h3>
                    @if (reminder.description) {
                      <p class="text-sm text-gray-500 mt-1">{{ reminder.description }}</p>
                    }
                    <div class="flex flex-wrap items-center gap-3 mt-2 text-sm">
                      <!-- Type Badge -->
                      <span [class]="getTypeBadgeClass(reminder.type)">
                        {{ formatType(reminder.type) }}
                      </span>

                      <!-- Due Date -->
                      <span class="flex items-center gap-1" [class.text-red-600]="isOverdue(reminder)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {{ formatDate(reminder.dueAt) }}
                      </span>

                      <!-- Linked Task -->
                      @if (reminder.task) {
                        <span class="flex items-center gap-1 text-indigo-600">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                          {{ reminder.task.title }}
                        </span>
                      }

                      <!-- Linked Customer -->
                      @if (reminder.customer) {
                        <span class="flex items-center gap-1 text-purple-600">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                          {{ reminder.customer.name }}
                        </span>
                      }

                      <!-- Recurring Badge -->
                      @if (reminder.isRecurring) {
                        <span class="flex items-center gap-1 text-blue-600">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                          Recurring
                        </span>
                      }
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2">
                  @if (reminder.status === 'pending') {
                    <button
                      (click)="snoozeReminder(reminder)"
                      class="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Snooze"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </button>
                  }
                  <button
                    (click)="editReminder(reminder)"
                    class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Edit"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    (click)="deleteReminder(reminder)"
                    class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Create/Edit Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b">
              <h2 class="text-xl font-bold">
                {{ editingReminder() ? 'Edit Reminder' : 'Create New Reminder' }}
              </h2>
            </div>

            <form (ngSubmit)="saveReminder()" class="p-6 space-y-4">
              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.title"
                  name="title"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Reminder title"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  [(ngModel)]="formData.description"
                  name="description"
                  rows="3"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add more details..."
                ></textarea>
              </div>

              <!-- Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  [(ngModel)]="formData.type"
                  name="type"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="task">Task</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <!-- Due Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input
                  type="datetime-local"
                  [(ngModel)]="formData.dueAt"
                  name="dueAt"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <!-- Link to Task -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Link to Task (optional)</label>
                <select
                  [(ngModel)]="formData.taskId"
                  name="taskId"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option [ngValue]="null">-- No task --</option>
                  @for (task of tasks(); track task.id) {
                    <option [ngValue]="task.id">{{ task.title }}</option>
                  }
                </select>
              </div>

              <!-- Link to Customer -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Link to Customer (optional)</label>
                <select
                  [(ngModel)]="formData.customerId"
                  name="customerId"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option [ngValue]="null">-- No customer --</option>
                  @for (customer of customers(); track customer.id) {
                    <option [ngValue]="customer.id">{{ customer.name }}</option>
                  }
                </select>
              </div>

              <!-- Recurring -->
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  [(ngModel)]="formData.isRecurring"
                  name="isRecurring"
                  id="isRecurring"
                  class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label for="isRecurring" class="text-sm text-gray-700">This is a recurring reminder</label>
              </div>

              @if (formData.isRecurring) {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Recurring Pattern</label>
                  <select
                    [(ngModel)]="formData.recurringPattern"
                    name="recurringPattern"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              }

              <!-- Actions -->
              <div class="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  {{ editingReminder() ? 'Update' : 'Create' }} Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Snooze Modal -->
      @if (showSnoozeModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div class="p-6 border-b">
              <h2 class="text-xl font-bold">Snooze Reminder</h2>
            </div>
            <div class="p-6 space-y-3">
              <button
                (click)="snoozeFor(15)"
                class="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
              >
                15 minutes
              </button>
              <button
                (click)="snoozeFor(60)"
                class="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
              >
                1 hour
              </button>
              <button
                (click)="snoozeFor(240)"
                class="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
              >
                4 hours
              </button>
              <button
                (click)="snoozeFor(1440)"
                class="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
              >
                Tomorrow
              </button>
              <button
                (click)="snoozeFor(10080)"
                class="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
              >
                Next week
              </button>
            </div>
            <div class="p-6 border-t">
              <button
                (click)="closeSnoozeModal()"
                class="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: ``
})
export class RemindersComponent implements OnInit {
  private reminderService = inject(ReminderService);
  private taskService = inject(TaskService);
  private customerService = inject(CustomerService);
  private businessService = inject(BusinessService);

  reminders = signal<Reminder[]>([]);
  tasks = signal<any[]>([]);
  customers = signal<any[]>([]);
  loading = signal(false);
  activeTab = signal<'upcoming' | 'overdue' | 'completed' | 'all'>('upcoming');

  showModal = signal(false);
  showSnoozeModal = signal(false);
  editingReminder = signal<Reminder | null>(null);
  snoozeTarget = signal<Reminder | null>(null);

  formData: CreateReminderInput = {
    title: '',
    description: '',
    type: 'task',
    dueAt: '',
    isRecurring: false,
    recurringPattern: 'weekly',
    taskId: undefined,
    customerId: undefined
  };

  filteredReminders = computed(() => {
    const all = this.reminders();
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);

    switch (this.activeTab()) {
      case 'upcoming':
        return all.filter(r => {
          const due = new Date(r.dueAt);
          return r.status === 'pending' && due >= now && due <= weekFromNow;
        });
      case 'overdue':
        return all.filter(r => {
          const due = new Date(r.dueAt);
          return r.status === 'pending' && due < now;
        });
      case 'completed':
        return all.filter(r => r.status === 'completed');
      default:
        return all;
    }
  });

  upcomingCount = computed(() => {
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);
    return this.reminders().filter(r => {
      const due = new Date(r.dueAt);
      return r.status === 'pending' && due >= now && due <= weekFromNow;
    }).length;
  });

  overdueCount = computed(() => {
    const now = new Date();
    return this.reminders().filter(r => {
      const due = new Date(r.dueAt);
      return r.status === 'pending' && due < now;
    }).length;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    this.reminderService.reminders$.subscribe(reminders => {
      this.reminders.set(reminders);
      this.loading.set(false);
    });

    this.reminderService.loadReminders();

    const businessId = this.businessService.getCurrentBusinessId();
    if (businessId) {
      this.taskService.tasks$.subscribe(tasks => this.tasks.set(tasks));
      this.taskService.loadTasks(businessId).subscribe();

      this.customerService.customers$.subscribe(customers => this.customers.set(customers));
      this.customerService.loadCustomers(businessId).subscribe();
    }
  }

  isOverdue(reminder: Reminder): boolean {
    return reminder.status === 'pending' && new Date(reminder.dueAt) < new Date();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days === 1) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days === -1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days < -1) {
      return `${Math.abs(days)} days ago`;
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  formatType(type: string): string {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getTypeBadgeClass(type: string): string {
    const base = 'px-2 py-0.5 rounded-full text-xs font-medium';
    switch (type) {
      case 'task': return `${base} bg-blue-100 text-blue-700`;
      case 'follow_up': return `${base} bg-purple-100 text-purple-700`;
      case 'meeting': return `${base} bg-green-100 text-green-700`;
      case 'deadline': return `${base} bg-red-100 text-red-700`;
      default: return `${base} bg-gray-100 text-gray-700`;
    }
  }

  openCreateModal(): void {
    this.editingReminder.set(null);
    this.formData = {
      title: '',
      description: '',
      type: 'task',
      dueAt: this.getDefaultDueDate(),
      isRecurring: false,
      recurringPattern: 'weekly',
      taskId: undefined,
      customerId: undefined
    };
    this.showModal.set(true);
  }

  editReminder(reminder: Reminder): void {
    this.editingReminder.set(reminder);
    this.formData = {
      title: reminder.title,
      description: reminder.description || '',
      type: reminder.type,
      dueAt: new Date(reminder.dueAt).toISOString().slice(0, 16),
      isRecurring: reminder.isRecurring,
      recurringPattern: reminder.recurringPattern || 'weekly',
      taskId: reminder.taskId || undefined,
      customerId: reminder.customerId || undefined
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingReminder.set(null);
  }

  saveReminder(): void {
    const input: CreateReminderInput = {
      title: this.formData.title,
      description: this.formData.description || undefined,
      type: this.formData.type,
      dueAt: new Date(this.formData.dueAt).toISOString(),
      isRecurring: this.formData.isRecurring,
      recurringPattern: this.formData.isRecurring ? this.formData.recurringPattern : undefined,
      taskId: this.formData.taskId || undefined,
      customerId: this.formData.customerId || undefined
    };

    const editing = this.editingReminder();
    if (editing) {
      this.reminderService.updateReminder(editing.id, input).subscribe(() => {
        this.closeModal();
      });
    } else {
      this.reminderService.createReminder(input).subscribe(() => {
        this.closeModal();
      });
    }
  }

  toggleComplete(reminder: Reminder): void {
    if (reminder.status === 'completed') {
      this.reminderService.updateReminder(reminder.id, { status: 'pending' } as any).subscribe();
    } else {
      this.reminderService.completeReminder(reminder.id).subscribe();
    }
  }

  snoozeReminder(reminder: Reminder): void {
    this.snoozeTarget.set(reminder);
    this.showSnoozeModal.set(true);
  }

  closeSnoozeModal(): void {
    this.showSnoozeModal.set(false);
    this.snoozeTarget.set(null);
  }

  snoozeFor(minutes: number): void {
    const target = this.snoozeTarget();
    if (target) {
      const newDue = new Date();
      newDue.setMinutes(newDue.getMinutes() + minutes);
      this.reminderService.snoozeReminder(target.id, newDue).subscribe(() => {
        this.closeSnoozeModal();
      });
    }
  }

  deleteReminder(reminder: Reminder): void {
    if (confirm('Are you sure you want to delete this reminder?')) {
      this.reminderService.deleteReminder(reminder.id).subscribe();
    }
  }

  private getDefaultDueDate(): string {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    date.setMinutes(0);
    return date.toISOString().slice(0, 16);
  }
}
