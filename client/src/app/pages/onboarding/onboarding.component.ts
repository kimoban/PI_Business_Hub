import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BusinessService } from '../../services/business.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div class="w-full max-w-lg">
        <!-- Progress -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-indigo-600">Step {{ step }} of 3</span>
            <span class="text-sm text-gray-500">{{ Math.round((step / 3) * 100) }}% complete</span>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-indigo-600 rounded-full transition-all duration-300"
                 [style.width.%]="(step / 3) * 100"></div>
          </div>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <!-- Step 1: Business Name -->
          <div *ngIf="step === 1" class="space-y-6">
            <div class="text-center">
              <div class="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">What's your business name?</h2>
              <p class="text-gray-500 mt-2">Let's start by giving your business an identity</p>
            </div>
            <div>
              <input [(ngModel)]="businessData.name"
                     class="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="e.g. Acme Solutions">
            </div>
          </div>

          <!-- Step 2: Industry -->
          <div *ngIf="step === 2" class="space-y-6">
            <div class="text-center">
              <div class="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">What industry are you in?</h2>
              <p class="text-gray-500 mt-2">This helps us customize your experience</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <button *ngFor="let industry of industries"
                      (click)="businessData.industry = industry.value"
                      [class]="businessData.industry === industry.value
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'"
                      class="p-4 border-2 rounded-xl text-left transition-colors">
                <span class="text-2xl mb-2 block">{{ industry.icon }}</span>
                <span class="font-medium">{{ industry.label }}</span>
              </button>
            </div>
          </div>

          <!-- Step 3: Goals -->
          <div *ngIf="step === 3" class="space-y-6">
            <div class="text-center">
              <div class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">What's your main goal?</h2>
              <p class="text-gray-500 mt-2">We'll help you get there</p>
            </div>
            <div class="space-y-3">
              <button *ngFor="let goal of goals"
                      (click)="businessData.goal = goal.value"
                      [class]="businessData.goal === goal.value
                        ? 'bg-indigo-50 border-indigo-600'
                        : 'bg-white border-gray-200 hover:border-gray-300'"
                      class="w-full p-4 border-2 rounded-xl text-left transition-colors flex items-center gap-4">
                <span class="text-2xl">{{ goal.icon }}</span>
                <div>
                  <p class="font-medium text-gray-900">{{ goal.label }}</p>
                  <p class="text-sm text-gray-500">{{ goal.description }}</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Navigation -->
          <div class="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button *ngIf="step > 1" (click)="step = step - 1"
                    class="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium">
              Back
            </button>
            <div *ngIf="step === 1"></div>
            <button (click)="nextStep()"
                    [disabled]="!canProceed()"
                    [class]="canProceed()
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-gray-300 cursor-not-allowed'"
                    class="px-6 py-2 text-white rounded-lg font-medium transition-colors">
              {{ step === 3 ? 'Get Started' : 'Continue' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class OnboardingComponent {
  private router = inject(Router);
  private businessService = inject(BusinessService);

  Math = Math;
  step = 1;

  businessData = {
    name: '',
    industry: '',
    goal: ''
  };

  industries = [
    { value: 'retail', label: 'Retail', icon: '🛍️' },
    { value: 'services', label: 'Services', icon: '💼' },
    { value: 'food', label: 'Food & Beverage', icon: '🍽️' },
    { value: 'health', label: 'Healthcare', icon: '🏥' },
    { value: 'tech', label: 'Technology', icon: '💻' },
    { value: 'other', label: 'Other', icon: '🏢' }
  ];

  goals = [
    { value: 'customers', label: 'Manage Customers', description: 'Keep track of customer relationships', icon: '👥' },
    { value: 'tasks', label: 'Organize Tasks', description: 'Stay on top of daily operations', icon: '✅' },
    { value: 'data', label: 'Collect Data', description: 'Gather insights with custom forms', icon: '📊' }
  ];

  canProceed(): boolean {
    switch (this.step) {
      case 1: return !!this.businessData.name.trim();
      case 2: return !!this.businessData.industry;
      case 3: return !!this.businessData.goal;
      default: return false;
    }
  }

  nextStep() {
    if (!this.canProceed()) return;

    if (this.step < 3) {
      this.step++;
    } else {
      this.completeOnboarding();
    }
  }

  completeOnboarding() {
    this.businessService.createBusiness(this.businessData).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        // Still navigate for demo
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
