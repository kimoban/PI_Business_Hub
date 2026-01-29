import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppLayoutComponent } from '../../components/app-layout/app-layout.component';
import { BusinessService } from '../../services/business.service';
import { FormService, Form, CreateForm } from '../../services/form.service';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'checkbox' | 'textarea' | 'currency';
  required: boolean;
  placeholder?: string;
  options?: string[];  // For select type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface SpreadsheetCell {
  value: string;
  type: 'header' | 'data';
  fieldId?: string;
}

interface FormSubmissionData {
  id: number;
  data: Record<string, any>;
  submittedBy?: string | null;
  createdAt?: string;
}

@Component({
  selector: 'app-forms',
  standalone: true,
  imports: [CommonModule, FormsModule, AppLayoutComponent],
  template: `
    <app-layout>
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-bold text-gray-900">Forms</h2>
            <p class="text-gray-500 mt-1">Create and manage data collection forms</p>
          </div>
          <div class="flex gap-3">
            <button (click)="showImportModal.set(true)"
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              Import CSV
            </button>
            <button (click)="openCreateModal()"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Create Form
            </button>
          </div>
        </div>

        <!-- Tabs: List / Builder -->
        @if (activeView() === 'list') {
          <!-- Forms Grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (form of forms(); track form.id) {
              <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between">
                  <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div class="flex gap-2">
                    <button (click)="editForm(form)" class="text-gray-400 hover:text-indigo-600" title="Edit Form">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button (click)="viewSubmissions(form)" class="text-gray-400 hover:text-green-600" title="View Submissions">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </button>
                    <button (click)="deleteForm(form)" class="text-gray-400 hover:text-red-600" title="Delete">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mt-4">{{ form.title }}</h3>
                <p class="text-gray-500 text-sm mt-1">{{ form.description || 'No description' }}</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  @if (form.schema && form.schema.fields) {
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {{ form.schema.fields.length }} fields
                    </span>
                  }
                </div>
                <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span class="text-xs text-gray-400">Created {{ form.createdAt | date:'shortDate' }}</span>
                  <button (click)="exportFormCSV(form)"
                          class="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
                    Export CSV
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                  </button>
                </div>
              </div>
            }

            <!-- Empty state -->
            @if (forms().length === 0) {
              <div class="col-span-full text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900">No forms yet</h3>
                <p class="text-gray-500 mt-1">Create your first form to start collecting data.</p>
              </div>
            }
          </div>
        }

        @if (activeView() === 'builder') {
          <!-- Form Builder View -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
            <!-- Builder Header -->
            <div class="p-4 border-b border-gray-200 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <button (click)="activeView.set('list')" class="text-gray-500 hover:text-gray-700">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <div>
                  <input
                    [(ngModel)]="builderForm.title"
                    class="text-xl font-bold text-gray-900 border-none focus:outline-none focus:ring-0 p-0"
                    placeholder="Form Title"
                  />
                  <input
                    [(ngModel)]="builderForm.description"
                    class="text-sm text-gray-500 border-none focus:outline-none focus:ring-0 p-0 w-full"
                    placeholder="Form description"
                  />
                </div>
              </div>
              <div class="flex gap-2">
                <button (click)="previewForm()"
                        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Preview
                </button>
                <button (click)="saveBuilderForm()"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Save Form
                </button>
              </div>
            </div>

            <div class="flex">
              <!-- Field Types Sidebar -->
              <div class="w-64 border-r border-gray-200 p-4 bg-gray-50">
                <h4 class="text-sm font-semibold text-gray-700 mb-3">Add Fields</h4>
                <div class="space-y-2">
                  @for (fieldType of fieldTypes; track fieldType.type) {
                    <button
                      (click)="addField(fieldType.type)"
                      class="w-full text-left px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition flex items-center gap-2"
                    >
                      <span [innerHTML]="fieldType.icon" class="w-5 h-5 text-gray-500"></span>
                      <span class="text-sm text-gray-700">{{ fieldType.label }}</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Form Canvas -->
              <div class="flex-1 p-6">
                @if (builderFields().length === 0) {
                  <div class="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    <p class="mt-2 text-sm text-gray-500">Add fields from the sidebar to build your form</p>
                  </div>
                } @else {
                  <div class="space-y-4">
                    @for (field of builderFields(); track field.id; let i = $index) {
                      <div class="border border-gray-200 rounded-lg p-4 bg-white hover:border-indigo-300 group">
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                              <input
                                [(ngModel)]="field.label"
                                class="font-medium text-gray-900 border-none focus:outline-none focus:ring-0 p-0"
                                placeholder="Field Label"
                              />
                              @if (field.required) {
                                <span class="text-red-500 text-sm">*</span>
                              }
                            </div>

                            <!-- Field Preview -->
                            @switch (field.type) {
                              @case ('text') {
                                <input type="text" disabled [placeholder]="field.placeholder || 'Text input'"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"/>
                              }
                              @case ('number') {
                                <input type="number" disabled [placeholder]="field.placeholder || '0'"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"/>
                              }
                              @case ('email') {
                                <input type="email" disabled [placeholder]="field.placeholder || 'email@example.com'"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"/>
                              }
                              @case ('phone') {
                                <input type="tel" disabled [placeholder]="field.placeholder || '+1 (555) 000-0000'"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"/>
                              }
                              @case ('date') {
                                <input type="date" disabled
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"/>
                              }
                              @case ('currency') {
                                <div class="relative">
                                  <span class="absolute left-3 top-2 text-gray-500">$</span>
                                  <input type="number" disabled placeholder="0.00"
                                         class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50"/>
                                </div>
                              }
                              @case ('select') {
                                <select disabled class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                  <option>Select an option</option>
                                  @for (opt of field.options || []; track opt) {
                                    <option>{{ opt }}</option>
                                  }
                                </select>
                              }
                              @case ('checkbox') {
                                <div class="flex items-center gap-2">
                                  <input type="checkbox" disabled class="w-4 h-4"/>
                                  <span class="text-gray-500 text-sm">{{ field.placeholder || 'Checkbox label' }}</span>
                                </div>
                              }
                              @case ('textarea') {
                                <textarea disabled [placeholder]="field.placeholder || 'Long text...'" rows="3"
                                          class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"></textarea>
                              }
                            }
                          </div>

                          <!-- Field Actions -->
                          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button (click)="toggleRequired(field)"
                                    [class.text-red-500]="field.required"
                                    [class.text-gray-400]="!field.required"
                                    class="p-1 hover:bg-gray-100 rounded" title="Toggle Required">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                              </svg>
                            </button>
                            <button (click)="editFieldOptions(field)"
                                    class="p-1 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded" title="Edit Options">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                            </button>
                            @if (i > 0) {
                              <button (click)="moveFieldUp(i)"
                                      class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                                </svg>
                              </button>
                            }
                            @if (i < builderFields().length - 1) {
                              <button (click)="moveFieldDown(i)"
                                      class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                              </button>
                            }
                            <button (click)="removeField(i)"
                                    class="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        }

        @if (activeView() === 'submissions') {
          <!-- Submissions Spreadsheet View -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="p-4 border-b border-gray-200 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <button (click)="activeView.set('list')" class="text-gray-500 hover:text-gray-700">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <div>
                  <h3 class="text-xl font-bold text-gray-900">{{ selectedForm()?.title }} - Submissions</h3>
                  <p class="text-sm text-gray-500">{{ submissions().length }} entries</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button (click)="exportSubmissionsCSV()"
                        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>

            <!-- Excel-like Spreadsheet -->
            <div class="overflow-auto max-h-[600px]">
              @if (submissions().length === 0) {
                <div class="text-center py-12">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <p class="mt-2 text-sm text-gray-500">No submissions yet</p>
                </div>
              } @else {
                <table class="w-full border-collapse">
                  <thead class="sticky top-0 z-10">
                    <tr class="bg-gray-100">
                      <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700 bg-gray-100">#</th>
                      @for (header of spreadsheetHeaders(); track header) {
                        <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700 bg-gray-100 min-w-[150px]">
                          {{ header }}
                        </th>
                      }
                      <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700 bg-gray-100">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (submission of submissions(); track submission.id; let i = $index) {
                      <tr class="hover:bg-blue-50">
                        <td class="border border-gray-300 px-4 py-2 text-sm text-gray-500 bg-gray-50">{{ i + 1 }}</td>
                        @for (header of spreadsheetHeaders(); track header) {
                          <td class="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                            {{ getSubmissionValue(submission, header) }}
                          </td>
                        }
                        <td class="border border-gray-300 px-4 py-2 text-sm text-gray-500">
                          {{ submission.createdAt | date:'short' }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          </div>
        }
      </div>

      <!-- Create Form Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Create New Form</h3>
            <form (ngSubmit)="createFormSimple()">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input [(ngModel)]="newForm.title" name="title" required
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                         placeholder="e.g. Customer Feedback">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea [(ngModel)]="newForm.description" name="description"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows="3" placeholder="What is this form for?"></textarea>
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button type="button" (click)="showCreateModal.set(false)"
                        class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="button" (click)="createFormSimple(); openBuilder()"
                        class="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                  Create & Design
                </button>
                <button type="submit"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Import CSV Modal -->
      @if (showImportModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Import CSV Data</h3>
            <div class="space-y-4">
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition cursor-pointer"
                   (click)="fileInput.click()">
                <input #fileInput type="file" accept=".csv" (change)="onFileSelected($event)" class="hidden"/>
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <p class="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                <p class="text-xs text-gray-400">CSV file up to 10MB</p>
              </div>
              @if (csvPreview().length > 0) {
                <div class="max-h-48 overflow-auto border rounded-lg">
                  <table class="w-full text-sm">
                    <thead class="bg-gray-50 sticky top-0">
                      <tr>
                        @for (header of csvPreview()[0]; track header; let i = $index) {
                          <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">{{ header }}</th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of csvPreview().slice(1, 6); track row) {
                        <tr class="border-t">
                          @for (cell of row; track cell) {
                            <td class="px-3 py-2 text-gray-700">{{ cell }}</td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                  @if (csvPreview().length > 6) {
                    <p class="text-xs text-gray-500 text-center py-2">
                      ... and {{ csvPreview().length - 6 }} more rows
                    </p>
                  }
                </div>
              }
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button (click)="showImportModal.set(false); csvPreview.set([])"
                      class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button (click)="importCSV()" [disabled]="csvPreview().length === 0"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Import
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Field Options Modal -->
      @if (showFieldOptionsModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Field Options</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                <input [(ngModel)]="editingField!.placeholder"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                       placeholder="Placeholder text"/>
              </div>
              @if (editingField?.type === 'select') {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Options (one per line)</label>
                  <textarea [(ngModel)]="selectOptionsText"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            rows="4" placeholder="Option 1&#10;Option 2&#10;Option 3"></textarea>
                </div>
              }
              @if (editingField?.type === 'number' || editingField?.type === 'currency') {
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
                    <input type="number" [(ngModel)]="editingField!.validation!.min"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
                    <input type="number" [(ngModel)]="editingField!.validation!.max"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/>
                  </div>
                </div>
              }
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button (click)="closeFieldOptions()"
                      class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button (click)="saveFieldOptions()"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      }
    </app-layout>
  `,
  styles: []
})
export class FormsComponent implements OnInit {
  private businessService = inject(BusinessService);
  private formService = inject(FormService);

  forms = signal<Form[]>([]);
  submissions = signal<FormSubmissionData[]>([]);
  businessId: number | null = null;

  activeView = signal<'list' | 'builder' | 'submissions'>('list');
  showCreateModal = signal(false);
  showImportModal = signal(false);
  showFieldOptionsModal = signal(false);

  selectedForm = signal<Form | null>(null);
  builderFields = signal<FormField[]>([]);
  csvPreview = signal<string[][]>([]);
  csvData: string[][] = [];

  builderForm = {
    title: '',
    description: ''
  };

  newForm: CreateForm = {
    title: '',
    description: ''
  };

  editingField: FormField | null = null;
  selectOptionsText = '';
  editingFormId: number | null = null;

  fieldTypes = [
    { type: 'text' as const, label: 'Text', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>' },
    { type: 'number' as const, label: 'Number', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>' },
    { type: 'email' as const, label: 'Email', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>' },
    { type: 'phone' as const, label: 'Phone', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>' },
    { type: 'date' as const, label: 'Date', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' },
    { type: 'currency' as const, label: 'Currency', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' },
    { type: 'select' as const, label: 'Dropdown', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>' },
    { type: 'checkbox' as const, label: 'Checkbox', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' },
    { type: 'textarea' as const, label: 'Long Text', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h10M4 18h7"/></svg>' },
  ];

  spreadsheetHeaders = computed(() => {
    const form = this.selectedForm();
    if (!form?.schema?.fields) return [];
    return form.schema.fields.map((f: FormField) => f.label);
  });

  ngOnInit() {
    this.businessService.loadProfile().subscribe(profile => {
      if (profile?.businessId) {
        this.businessId = profile.businessId;
        this.loadForms();
      }
    });
  }

  loadForms() {
    if (!this.businessId) return;
    this.formService.loadForms(this.businessId).subscribe(forms => this.forms.set(forms));
  }

  openCreateModal() {
    this.newForm = { title: '', description: '' };
    this.showCreateModal.set(true);
  }

  createFormSimple() {
    if (!this.businessId || !this.newForm.title) return;

    this.formService.createForm(this.businessId, this.newForm).subscribe((form) => {
      this.showCreateModal.set(false);
      this.loadForms();
    });
  }

  openBuilder() {
    this.builderForm = {
      title: this.newForm.title,
      description: this.newForm.description || ''
    };
    this.builderFields.set([]);
    this.editingFormId = null;
    this.activeView.set('builder');
  }

  editForm(form: Form) {
    this.selectedForm.set(form);
    this.editingFormId = form.id;
    this.builderForm = {
      title: form.title,
      description: form.description || ''
    };
    this.builderFields.set(form.schema?.fields || []);
    this.activeView.set('builder');
  }

  addField(type: FormField['type']) {
    const newField: FormField = {
      id: crypto.randomUUID(),
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      type,
      required: false,
      placeholder: '',
      options: type === 'select' ? ['Option 1', 'Option 2'] : undefined,
      validation: {}
    };
    this.builderFields.set([...this.builderFields(), newField]);
  }

  removeField(index: number) {
    const fields = [...this.builderFields()];
    fields.splice(index, 1);
    this.builderFields.set(fields);
  }

  moveFieldUp(index: number) {
    if (index === 0) return;
    const fields = [...this.builderFields()];
    [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]];
    this.builderFields.set(fields);
  }

  moveFieldDown(index: number) {
    const fields = [...this.builderFields()];
    if (index === fields.length - 1) return;
    [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
    this.builderFields.set(fields);
  }

  toggleRequired(field: FormField) {
    field.required = !field.required;
    this.builderFields.set([...this.builderFields()]);
  }

  editFieldOptions(field: FormField) {
    this.editingField = { ...field };
    this.selectOptionsText = field.options?.join('\n') || '';
    if (!this.editingField.validation) {
      this.editingField.validation = {};
    }
    this.showFieldOptionsModal.set(true);
  }

  closeFieldOptions() {
    this.editingField = null;
    this.selectOptionsText = '';
    this.showFieldOptionsModal.set(false);
  }

  saveFieldOptions() {
    if (!this.editingField) return;

    const fields = this.builderFields();
    const index = fields.findIndex(f => f.id === this.editingField!.id);
    if (index !== -1) {
      if (this.editingField.type === 'select') {
        this.editingField.options = this.selectOptionsText.split('\n').filter(o => o.trim());
      }
      fields[index] = this.editingField;
      this.builderFields.set([...fields]);
    }
    this.closeFieldOptions();
  }

  previewForm() {
    // TODO: Open preview modal
    alert('Preview feature coming soon!');
  }

  saveBuilderForm() {
    if (!this.businessId || !this.builderForm.title) return;

    const formData: any = {
      title: this.builderForm.title,
      description: this.builderForm.description,
      schema: { fields: this.builderFields() }
    };

    if (this.editingFormId) {
      // Update existing form
      this.formService.updateForm(this.businessId, this.editingFormId, formData).subscribe(() => {
        this.loadForms();
        this.activeView.set('list');
      });
    } else {
      // Create new form
      this.formService.createForm(this.businessId, formData).subscribe(() => {
        this.loadForms();
        this.activeView.set('list');
      });
    }
  }

  deleteForm(form: Form) {
    if (!this.businessId || !confirm(`Delete "${form.title}"?`)) return;
    this.formService.deleteForm(this.businessId, form.id).subscribe(() => {
      this.loadForms();
    });
  }

  viewSubmissions(form: Form) {
    this.selectedForm.set(form);
    this.formService.getSubmissions(form.id).subscribe(submissions => {
      this.submissions.set(submissions);
      this.activeView.set('submissions');
    });
  }

  getSubmissionValue(submission: FormSubmissionData, header: string): string {
    if (!submission.data) return '';

    // Find the field by label
    const form = this.selectedForm();
    if (!form?.schema?.fields) return '';

    const field = form.schema.fields.find((f: FormField) => f.label === header);
    if (!field) return '';

    const value = submission.data[field.id] || submission.data[field.label] || '';
    return String(value);
  }

  exportFormCSV(form: Form) {
    this.formService.getSubmissions(form.id).subscribe(submissions => {
      if (submissions.length === 0) {
        alert('No submissions to export');
        return;
      }

      const headers = form.schema?.fields?.map((f: FormField) => f.label) || [];
      const rows = submissions.map(s =>
        headers.map((h: string) => {
          const field = form.schema?.fields?.find((f: FormField) => f.label === h);
          return field ? (s.data[field.id] || s.data[field.label] || '') : '';
        })
      );

      this.downloadCSV([headers, ...rows], `${form.title}_submissions.csv`);
    });
  }

  exportSubmissionsCSV() {
    const form = this.selectedForm();
    if (!form) return;

    const headers = this.spreadsheetHeaders();
    const rows = this.submissions().map(s =>
      headers.map((h: string) => this.getSubmissionValue(s, h))
    );

    this.downloadCSV([headers, ...rows], `${form.title}_submissions.csv`);
  }

  downloadCSV(data: string[][], filename: string) {
    const csvContent = data.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.csvData = this.parseCSV(text);
      this.csvPreview.set(this.csvData);
    };
    reader.readAsText(file);
  }

  parseCSV(text: string): string[][] {
    const lines = text.split('\n');
    return lines.map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    }).filter(row => row.some(cell => cell.length > 0));
  }

  importCSV() {
    if (this.csvData.length < 2) return;

    const headers = this.csvData[0];
    const fields: FormField[] = headers.map((header, i) => ({
      id: crypto.randomUUID(),
      label: header || `Column ${i + 1}`,
      type: 'text',
      required: false
    }));

    this.builderForm = {
      title: 'Imported Form',
      description: 'Form created from CSV import'
    };
    this.builderFields.set(fields);
    this.showImportModal.set(false);
    this.csvPreview.set([]);
    this.activeView.set('builder');
  }
}
