import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppLayoutComponent } from '../../components/app-layout/app-layout.component';
import { AdminService, UserWithProfile, BusinessAnalytics, UserPermissions } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AppLayoutComponent],
  template: `
    <app-layout>
      <div class="space-y-8">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-bold text-gray-900">Admin Panel</h2>
            <p class="text-gray-500 mt-1">
              Manage your team and view business analytics.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              {{ permissions?.role | titlecase }}
            </span>
          </div>
        </div>

        @if (!isAdmin) {
          <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <h3 class="text-lg font-semibold text-red-800 mb-2">Access Denied</h3>
            <p class="text-red-600">You need admin privileges to access this page.</p>
          </div>
        } @else {
          <!-- Analytics Overview -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ analytics?.totalTasks || 0 }}</p>
                  <p class="text-sm text-gray-500">Total Tasks</p>
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
                  <p class="text-2xl font-bold text-gray-900">{{ analytics?.totalCustomers || 0 }}</p>
                  <p class="text-sm text-gray-500">Customers</p>
                </div>
              </div>
            </div>

            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ users.length }}</p>
                  <p class="text-sm text-gray-500">Team Members</p>
                </div>
              </div>
            </div>

            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ analytics?.newCustomersLast30Days || 0 }}</p>
                  <p class="text-sm text-gray-500">New (30 days)</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Analytics Charts -->
          <div class="grid lg:grid-cols-2 gap-8">
            <!-- Task Status -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Task Status Breakdown</h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">To Do</span>
                    <span class="font-medium text-yellow-600">{{ analytics?.tasksByStatus?.todo || 0 }}</span>
                  </div>
                  <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-yellow-500 rounded-full transition-all duration-300"
                         [style.width.%]="getTaskStatusPercent('todo')"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">In Progress</span>
                    <span class="font-medium text-blue-600">{{ analytics?.tasksByStatus?.in_progress || 0 }}</span>
                  </div>
                  <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full transition-all duration-300"
                         [style.width.%]="getTaskStatusPercent('in_progress')"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">Done</span>
                    <span class="font-medium text-green-600">{{ analytics?.tasksByStatus?.done || 0 }}</span>
                  </div>
                  <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full transition-all duration-300"
                         [style.width.%]="getTaskStatusPercent('done')"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Task Priority -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">High Priority</span>
                    <span class="font-medium text-red-600">{{ analytics?.tasksByPriority?.high || 0 }}</span>
                  </div>
                  <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-red-500 rounded-full transition-all duration-300"
                         [style.width.%]="getPriorityPercent('high')"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">Medium Priority</span>
                    <span class="font-medium text-yellow-600">{{ analytics?.tasksByPriority?.medium || 0 }}</span>
                  </div>
                  <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-yellow-500 rounded-full transition-all duration-300"
                         [style.width.%]="getPriorityPercent('medium')"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">Low Priority</span>
                    <span class="font-medium text-gray-600">{{ analytics?.tasksByPriority?.low || 0 }}</span>
                  </div>
                  <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-gray-400 rounded-full transition-all duration-300"
                         [style.width.%]="getPriorityPercent('low')"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Team Management -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Team Members</h3>
              <button (click)="openInviteModal()"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Invite Member
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th class="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th class="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th class="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (user of users; track user.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="py-4 px-6">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span class="text-indigo-600 font-medium">
                              {{ (user.user.firstName || user.user.email || 'U')[0] | uppercase }}
                            </span>
                          </div>
                          <div>
                            <p class="font-medium text-gray-900">
                              {{ user.user.firstName }} {{ user.user.lastName }}
                            </p>
                            <p class="text-sm text-gray-500">{{ user.user.email }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="py-4 px-6">
                        <select [(ngModel)]="user.role"
                                (change)="updateRole(user)"
                                [disabled]="user.userId === currentUserId"
                                class="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
                          <option value="admin">Admin</option>
                          <option value="staff">Staff</option>
                          <option value="guest">Guest</option>
                        </select>
                      </td>
                      <td class="py-4 px-6">
                        @if (user.userId !== currentUserId) {
                          <button class="text-red-600 hover:text-red-700 text-sm font-medium">
                            Remove
                          </button>
                        } @else {
                          <span class="text-gray-400 text-sm">You</span>
                        }
                      </td>
                    </tr>
                  }

                  @if (users.length === 0) {
                    <tr>
                      <td colspan="3" class="py-8 text-center text-gray-500">
                        No team members found.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900 mb-1">Business Settings</h4>
              <p class="text-sm text-gray-500">Configure your business profile and preferences</p>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900 mb-1">Export Data</h4>
              <p class="text-sm text-gray-500">Download your business data as CSV or JSON</p>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900 mb-1">Security</h4>
              <p class="text-sm text-gray-500">Manage security settings and audit logs</p>
            </div>
          </div>
        }

        <!-- Invite Modal -->
        @if (showInviteModal) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="closeInviteModal()">
            <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" (click)="$event.stopPropagation()">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Invite Team Member</h3>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" [(ngModel)]="inviteEmail"
                         placeholder="colleague@company.com"
                         class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select [(ngModel)]="inviteRole"
                          class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="guest">Guest (View Only)</option>
                  </select>
                </div>

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  <p><strong>Note:</strong> In production, this would send an email invitation. For now, users need to sign up and will be auto-assigned to your business.</p>
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button (click)="closeInviteModal()"
                        class="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                  Cancel
                </button>
                <button (click)="sendInvite()"
                        [disabled]="!inviteEmail"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </app-layout>
  `,
  styles: []
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);

  users: UserWithProfile[] = [];
  analytics: BusinessAnalytics | null = null;
  permissions: UserPermissions | null = null;
  isAdmin = false;

  showInviteModal = false;
  inviteEmail = '';
  inviteRole = 'staff';

  get currentUserId(): string {
    return this.authService.currentUser?.id || '';
  }

  ngOnInit() {
    // Load permissions first to check admin access
    this.adminService.loadPermissions().subscribe(perms => {
      this.permissions = perms;
      this.isAdmin = perms.role === 'admin';

      if (this.isAdmin) {
        this.loadData();
      }
    });
  }

  private loadData() {
    this.adminService.loadUsers().subscribe(users => this.users = users);
    this.adminService.loadAnalytics().subscribe(analytics => this.analytics = analytics);
  }

  getTaskStatusPercent(status: 'todo' | 'in_progress' | 'done'): number {
    if (!this.analytics || this.analytics.totalTasks === 0) return 0;
    const count = this.analytics.tasksByStatus[status] || 0;
    return (count / this.analytics.totalTasks) * 100;
  }

  getPriorityPercent(priority: 'high' | 'medium' | 'low'): number {
    if (!this.analytics || this.analytics.totalTasks === 0) return 0;
    const count = this.analytics.tasksByPriority[priority] || 0;
    return (count / this.analytics.totalTasks) * 100;
  }

  updateRole(user: UserWithProfile) {
    this.adminService.updateUserRole(user.userId, user.role).subscribe({
      next: () => {
        console.log('Role updated successfully');
      },
      error: (err) => {
        console.error('Failed to update role', err);
        // Revert on error - reload users
        this.adminService.loadUsers().subscribe(users => this.users = users);
      }
    });
  }

  openInviteModal() {
    this.showInviteModal = true;
    this.inviteEmail = '';
    this.inviteRole = 'staff';
  }

  closeInviteModal() {
    this.showInviteModal = false;
  }

  sendInvite() {
    if (!this.inviteEmail) return;

    this.adminService.inviteUser(this.inviteEmail, this.inviteRole).subscribe({
      next: (response) => {
        console.log('Invitation sent', response);
        this.closeInviteModal();
        // Show success message (could use a toast service)
        alert('Invitation sent successfully!');
      },
      error: (err) => {
        console.error('Failed to send invitation', err);
        alert('Failed to send invitation. Please try again.');
      }
    });
  }
}
