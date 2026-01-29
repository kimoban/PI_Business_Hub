import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppLayoutComponent } from '../../components/app-layout/app-layout.component';
import { BusinessService } from '../../services/business.service';
import { FormService, Form, CreateForm } from '../../services/form.service';

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
          <button (click)="showCreateModal = true"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Create Form
          </button>
        </div>

        <!-- Forms Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let form of forms"
               class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <button (click)="deleteForm(form)" class="text-gray-400 hover:text-red-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mt-4">{{ form.title }}</h3>
            <p class="text-gray-500 text-sm mt-1">{{ form.description || 'No description' }}</p>
            <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span class="text-xs text-gray-400">Created {{ form.createdAt | date:'shortDate' }}</span>
              <button class="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
                View submissions
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Empty state -->
          <div *ngIf="forms.length === 0" class="col-span-full text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900">No forms yet</h3>
            <p class="text-gray-500 mt-1">Create your first form to start collecting data.</p>
          </div>
        </div>
      </div>

      <!-- Create Form Modal -->
      <div *ngIf="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Create New Form</h3>
          <form (ngSubmit)="createForm()">
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
              <button type="button" (click)="showCreateModal = false"
                      class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Create Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </app-layout>
  `,
  styles: []
})
export class FormsComponent implements OnInit {
  private businessService = inject(BusinessService);
  private formService = inject(FormService);

  forms: Form[] = [];
  showCreateModal = false;
  businessId: number | null = null;

  newForm: CreateForm = {
    title: '',
    description: ''
  };

  ngOnInit() {
    this.businessService.loadProfile().subscribe(profile => {
      if (profile?.businessId) {
        this.businessId = profile.businessId;
        this.formService.loadForms(profile.businessId).subscribe(forms => this.forms = forms);
      }
    });
  }

  createForm() {
    if (!this.businessId || !this.newForm.title) return;

    this.formService.createForm(this.businessId, this.newForm).subscribe(() => {
      this.showCreateModal = false;
      this.newForm = { title: '', description: '' };
      this.formService.loadForms(this.businessId!).subscribe(forms => this.forms = forms);
    });
  }

  deleteForm(form: Form) {
    if (!this.businessId || !confirm(`Delete "${form.title}"?`)) return;
    this.formService.deleteForm(this.businessId, form.id).subscribe(() => {
      this.formService.loadForms(this.businessId!).subscribe(forms => this.forms = forms);
    });
  }
}
