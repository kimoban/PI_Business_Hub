import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppLayoutComponent } from '../../components/app-layout/app-layout.component';
import { AuthService } from '../../services/auth.service';
import { BusinessService } from '../../services/business.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, AppLayoutComponent],
  template: `
    <app-layout>
      <div class="space-y-6 max-w-4xl">
        <!-- Header -->
        <div>
          <h2 class="text-3xl font-bold text-gray-900">Settings</h2>
          <p class="text-gray-500 mt-1">Manage your business profile and preferences</p>
        </div>

        <!-- Business Profile -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Business Profile</h3>
            <p class="text-sm text-gray-500">Update your business information</p>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input [(ngModel)]="businessProfile.name"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="Your business name">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select [(ngModel)]="businessProfile.industry"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Select industry</option>
                <option value="retail">Retail</option>
                <option value="services">Professional Services</option>
                <option value="food">Food & Beverage</option>
                <option value="health">Healthcare</option>
                <option value="tech">Technology</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea [(ngModel)]="businessProfile.description"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        rows="3" placeholder="Brief description of your business"></textarea>
            </div>
            <button (click)="saveBusinessProfile()"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        <!-- Account Settings -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Account</h3>
            <p class="text-sm text-gray-500">Manage your account settings</p>
          </div>
          <div class="p-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <span class="text-2xl font-bold text-indigo-600">
                  {{ (user?.firstName || 'U')[0] }}{{ (user?.lastName || '')[0] }}
                </span>
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ user?.firstName }} {{ user?.lastName }}</p>
                <p class="text-sm text-gray-500">{{ user?.email || 'demo@example.com' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
            <p class="text-sm text-gray-500">Configure how you receive notifications</p>
          </div>
          <div class="p-6 space-y-4">
            <label class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">Email Notifications</p>
                <p class="text-sm text-gray-500">Receive updates via email</p>
              </div>
              <input type="checkbox" [(ngModel)]="notifications.email"
                     class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500">
            </label>
            <label class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">Task Reminders</p>
                <p class="text-sm text-gray-500">Get reminded about upcoming tasks</p>
              </div>
              <input type="checkbox" [(ngModel)]="notifications.taskReminders"
                     class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500">
            </label>
            <label class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">New Customer Alerts</p>
                <p class="text-sm text-gray-500">Be notified when new customers are added</p>
              </div>
              <input type="checkbox" [(ngModel)]="notifications.newCustomers"
                     class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500">
            </label>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-white rounded-xl border border-red-200 shadow-sm">
          <div class="px-6 py-4 border-b border-red-200">
            <h3 class="text-lg font-semibold text-red-600">Danger Zone</h3>
            <p class="text-sm text-red-500">Irreversible actions</p>
          </div>
          <div class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">Delete Business</p>
                <p class="text-sm text-gray-500">Permanently delete your business and all data</p>
              </div>
              <button class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                Delete Business
              </button>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: []
})
export class SettingsComponent {
  private authService = inject(AuthService);
  private businessService = inject(BusinessService);

  user: any = null;

  businessProfile = {
    name: '',
    industry: '',
    description: ''
  };

  notifications = {
    email: true,
    taskReminders: true,
    newCustomers: false
  };

  ngOnInit() {
    this.authService.user$.subscribe(user => this.user = user);

    this.businessService.loadProfile().subscribe(profile => {
      if (profile) {
        this.businessProfile = {
          name: profile.business?.name || '',
          industry: profile.business?.industry || '',
          description: ''
        };
      }
    });
  }

  saveBusinessProfile() {
    // Would update via API
    alert('Settings saved! (Demo mode)');
  }
}
