import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppLayoutComponent } from '../../components/app-layout/app-layout.component';
import { BusinessService } from '../../services/business.service';
import { TaskService, Task, CreateTask } from '../../services/task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, AppLayoutComponent],
  template: `
    <app-layout>
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-bold text-gray-900">Tasks</h2>
            <p class="text-gray-500 mt-1">Manage and track your team's work</p>
          </div>
          <button (click)="showCreateModal = true"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Task
          </button>
        </div>

        <!-- Task Columns -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- To Do -->
          <div class="bg-gray-50 rounded-xl p-4">
            <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span class="w-3 h-3 bg-yellow-400 rounded-full"></span>
              To Do ({{ todoTasks.length }})
            </h3>
            <div class="space-y-3">
              <div *ngFor="let task of todoTasks"
                   class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
                  <span [ngClass]="{
                    'bg-red-100 text-red-700': task.priority === 'high',
                    'bg-yellow-100 text-yellow-700': task.priority === 'medium',
                    'bg-gray-100 text-gray-600': task.priority === 'low'
                  }" class="px-2 py-0.5 rounded text-xs font-medium">
                    {{ task.priority }}
                  </span>
                </div>
                <p *ngIf="task.description" class="text-sm text-gray-500 mt-2">{{ task.description }}</p>
                <div class="mt-3 flex gap-2">
                  <button (click)="updateStatus(task, 'in_progress')"
                          class="text-xs text-indigo-600 hover:text-indigo-800">Start →</button>
                  <button (click)="deleteTask(task)"
                          class="text-xs text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
              <div *ngIf="todoTasks.length === 0" class="text-center py-8 text-gray-400 text-sm">
                No tasks to do
              </div>
            </div>
          </div>

          <!-- In Progress -->
          <div class="bg-gray-50 rounded-xl p-4">
            <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span class="w-3 h-3 bg-blue-400 rounded-full"></span>
              In Progress ({{ inProgressTasks.length }})
            </h3>
            <div class="space-y-3">
              <div *ngFor="let task of inProgressTasks"
                   class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
                  <span [ngClass]="{
                    'bg-red-100 text-red-700': task.priority === 'high',
                    'bg-yellow-100 text-yellow-700': task.priority === 'medium',
                    'bg-gray-100 text-gray-600': task.priority === 'low'
                  }" class="px-2 py-0.5 rounded text-xs font-medium">
                    {{ task.priority }}
                  </span>
                </div>
                <p *ngIf="task.description" class="text-sm text-gray-500 mt-2">{{ task.description }}</p>
                <div class="mt-3 flex gap-2">
                  <button (click)="updateStatus(task, 'done')"
                          class="text-xs text-green-600 hover:text-green-800">Complete ✓</button>
                  <button (click)="updateStatus(task, 'todo')"
                          class="text-xs text-gray-600 hover:text-gray-800">← Back</button>
                </div>
              </div>
              <div *ngIf="inProgressTasks.length === 0" class="text-center py-8 text-gray-400 text-sm">
                No tasks in progress
              </div>
            </div>
          </div>

          <!-- Done -->
          <div class="bg-gray-50 rounded-xl p-4">
            <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span class="w-3 h-3 bg-green-400 rounded-full"></span>
              Done ({{ doneTasks.length }})
            </h3>
            <div class="space-y-3">
              <div *ngFor="let task of doneTasks"
                   class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm opacity-75">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="font-medium text-gray-900 line-through">{{ task.title }}</h4>
                </div>
                <div class="mt-3 flex gap-2">
                  <button (click)="updateStatus(task, 'in_progress')"
                          class="text-xs text-gray-600 hover:text-gray-800">Reopen</button>
                  <button (click)="deleteTask(task)"
                          class="text-xs text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
              <div *ngIf="doneTasks.length === 0" class="text-center py-8 text-gray-400 text-sm">
                No completed tasks
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Task Modal -->
      <div *ngIf="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Create New Task</h3>
          <form (ngSubmit)="createTask()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input [(ngModel)]="newTask.title" name="title" required
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                       placeholder="Task title">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea [(ngModel)]="newTask.description" name="description"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          rows="3" placeholder="Task description"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select [(ngModel)]="newTask.priority" name="priority"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" (click)="showCreateModal = false"
                      class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </app-layout>
  `,
  styles: []
})
export class TasksComponent implements OnInit {
  private businessService = inject(BusinessService);
  private taskService = inject(TaskService);

  tasks: Task[] = [];
  showCreateModal = false;
  businessId: number | null = null;

  newTask: CreateTask = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo'
  };

  get todoTasks(): Task[] {
    return this.tasks.filter(t => t.status === 'todo');
  }

  get inProgressTasks(): Task[] {
    return this.tasks.filter(t => t.status === 'in_progress');
  }

  get doneTasks(): Task[] {
    return this.tasks.filter(t => t.status === 'done');
  }

  ngOnInit() {
    this.businessService.loadProfile().subscribe(profile => {
      if (profile?.businessId) {
        this.businessId = profile.businessId;
        this.taskService.loadTasks(profile.businessId).subscribe(tasks => this.tasks = tasks);
      }
    });
  }

  createTask() {
    if (!this.businessId || !this.newTask.title) return;

    this.taskService.createTask(this.businessId, this.newTask).subscribe(() => {
      this.showCreateModal = false;
      this.newTask = { title: '', description: '', priority: 'medium', status: 'todo' };
      this.taskService.loadTasks(this.businessId!).subscribe(tasks => this.tasks = tasks);
    });
  }

  updateStatus(task: Task, status: 'todo' | 'in_progress' | 'done') {
    if (!this.businessId) return;
    this.taskService.updateTask(this.businessId, task.id, { status }).subscribe(() => {
      this.taskService.loadTasks(this.businessId!).subscribe(tasks => this.tasks = tasks);
    });
  }

  deleteTask(task: Task) {
    if (!this.businessId || !confirm('Delete this task?')) return;
    this.taskService.deleteTask(this.businessId, task.id).subscribe(() => {
      this.taskService.loadTasks(this.businessId!).subscribe(tasks => this.tasks = tasks);
    });
  }
}
