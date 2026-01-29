import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AppLayoutComponent } from '../../components/app-layout/app-layout.component';
import { BusinessService } from '../../services/business.service';
import { TaskService, Task, CreateTask } from '../../services/task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, AppLayoutComponent],
  template: `
    <app-layout>
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-bold text-gray-900">Tasks</h2>
            <p class="text-gray-500 mt-1">Drag and drop tasks to update their status</p>
          </div>
          <button (click)="showCreateModal = true"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Task
          </button>
        </div>

        <!-- Task Columns with Drag & Drop -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6" cdkDropListGroup>
          <!-- To Do -->
          <div class="bg-gray-50 rounded-xl p-4 min-h-[400px]">
            <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span class="w-3 h-3 bg-yellow-400 rounded-full"></span>
              To Do ({{ todoTasks.length }})
            </h3>
            <div cdkDropList
                 #todoList="cdkDropList"
                 [cdkDropListData]="todoTasks"
                 [cdkDropListConnectedTo]="[inProgressList, doneList]"
                 (cdkDropListDropped)="drop($event, 'todo')"
                 class="space-y-3 min-h-[300px]">
              <div *ngFor="let task of todoTasks"
                   cdkDrag
                   [cdkDragData]="task"
                   class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
                  <span [ngClass]="{
                    'bg-red-100 text-red-700': task.priority === 'high',
                    'bg-yellow-100 text-yellow-700': task.priority === 'medium',
                    'bg-gray-100 text-gray-600': task.priority === 'low'
                  }" class="px-2 py-0.5 rounded text-xs font-medium shrink-0">
                    {{ task.priority }}
                  </span>
                </div>
                <p *ngIf="task.description" class="text-sm text-gray-500 mt-2 line-clamp-2">{{ task.description }}</p>
                <div *ngIf="task.dueDate" class="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ task.dueDate | date:'shortDate' }}
                </div>
                <div class="mt-3 flex gap-2">
                  <button (click)="editTask(task)" class="text-xs text-indigo-600 hover:text-indigo-800">Edit</button>
                  <button (click)="deleteTask(task)" class="text-xs text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
              <div *ngIf="todoTasks.length === 0" class="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                Drop tasks here or click Add Task
              </div>
            </div>
          </div>

          <!-- In Progress -->
          <div class="bg-blue-50 rounded-xl p-4 min-h-[400px]">
            <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span class="w-3 h-3 bg-blue-400 rounded-full"></span>
              In Progress ({{ inProgressTasks.length }})
            </h3>
            <div cdkDropList
                 #inProgressList="cdkDropList"
                 [cdkDropListData]="inProgressTasks"
                 [cdkDropListConnectedTo]="[todoList, doneList]"
                 (cdkDropListDropped)="drop($event, 'in_progress')"
                 class="space-y-3 min-h-[300px]">
              <div *ngFor="let task of inProgressTasks"
                   cdkDrag
                   [cdkDragData]="task"
                   class="bg-white p-4 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
                  <span [ngClass]="{
                    'bg-red-100 text-red-700': task.priority === 'high',
                    'bg-yellow-100 text-yellow-700': task.priority === 'medium',
                    'bg-gray-100 text-gray-600': task.priority === 'low'
                  }" class="px-2 py-0.5 rounded text-xs font-medium shrink-0">
                    {{ task.priority }}
                  </span>
                </div>
                <p *ngIf="task.description" class="text-sm text-gray-500 mt-2 line-clamp-2">{{ task.description }}</p>
                <div *ngIf="task.dueDate" class="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ task.dueDate | date:'shortDate' }}
                </div>
                <div class="mt-3 flex gap-2">
                  <button (click)="editTask(task)" class="text-xs text-indigo-600 hover:text-indigo-800">Edit</button>
                  <button (click)="deleteTask(task)" class="text-xs text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
              <div *ngIf="inProgressTasks.length === 0" class="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-blue-200 rounded-lg">
                Drop tasks here to start working
              </div>
            </div>
          </div>

          <!-- Done -->
          <div class="bg-green-50 rounded-xl p-4 min-h-[400px]">
            <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span class="w-3 h-3 bg-green-400 rounded-full"></span>
              Done ({{ doneTasks.length }})
            </h3>
            <div cdkDropList
                 #doneList="cdkDropList"
                 [cdkDropListData]="doneTasks"
                 [cdkDropListConnectedTo]="[todoList, inProgressList]"
                 (cdkDropListDropped)="drop($event, 'done')"
                 class="space-y-3 min-h-[300px]">
              <div *ngFor="let task of doneTasks"
                   cdkDrag
                   [cdkDragData]="task"
                   class="bg-white p-4 rounded-lg border border-green-200 shadow-sm opacity-75 cursor-grab active:cursor-grabbing">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="font-medium text-gray-900 line-through">{{ task.title }}</h4>
                </div>
                <div class="mt-3 flex gap-2">
                  <button (click)="deleteTask(task)" class="text-xs text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
              <div *ngIf="doneTasks.length === 0" class="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-green-200 rounded-lg">
                Drop completed tasks here
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Task Modal -->
      <div *ngIf="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ editingTask ? 'Edit Task' : 'Create New Task' }}</h3>
          <form (ngSubmit)="saveTask()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
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
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select [(ngModel)]="newTask.priority" name="priority"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" [(ngModel)]="newTask.dueDate" name="dueDate"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" (click)="closeModal()"
                      class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                {{ editingTask ? 'Update' : 'Create' }} Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      opacity: 0.9;
    }
    .cdk-drag-placeholder {
      opacity: 0.3;
      background: #e2e8f0;
      border: 2px dashed #94a3b8;
      border-radius: 8px;
    }
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class TasksComponent implements OnInit {
  private businessService = inject(BusinessService);
  private taskService = inject(TaskService);

  tasks: Task[] = [];
  showCreateModal = false;
  editingTask: Task | null = null;
  businessId: number | null = null;

  newTask: CreateTask & { dueDate?: string } = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: ''
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
        this.loadTasks();
      }
    });
  }

  loadTasks() {
    if (!this.businessId) return;
    this.taskService.loadTasks(this.businessId).subscribe(tasks => this.tasks = tasks);
  }

  drop(event: CdkDragDrop<Task[]>, newStatus: 'todo' | 'in_progress' | 'done') {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.item.data as Task;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      // Update status in backend
      if (this.businessId) {
        this.taskService.updateTask(this.businessId, task.id, { status: newStatus }).subscribe();
      }
    }
  }

  editTask(task: Task) {
    this.editingTask = task;
    this.newTask = {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    };
    this.showCreateModal = true;
  }

  saveTask() {
    if (!this.businessId || !this.newTask.title) return;

    const taskData = { ...this.newTask };
    if (!taskData.dueDate) delete taskData.dueDate;

    if (this.editingTask) {
      this.taskService.updateTask(this.businessId, this.editingTask.id, taskData).subscribe(() => {
        this.closeModal();
        this.loadTasks();
      });
    } else {
      this.taskService.createTask(this.businessId, taskData).subscribe(() => {
        this.closeModal();
        this.loadTasks();
      });
    }
  }

  closeModal() {
    this.showCreateModal = false;
    this.editingTask = null;
    this.newTask = { title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' };
  }

  deleteTask(task: Task) {
    if (!this.businessId || !confirm('Delete this task?')) return;
    this.taskService.deleteTask(this.businessId, task.id).subscribe(() => this.loadTasks());
  }
}
