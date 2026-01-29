import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppLayoutComponent } from '../../components/app-layout/app-layout.component';
import { BusinessService } from '../../services/business.service';
import { CustomerService, Customer, CreateCustomer } from '../../services/customer.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, AppLayoutComponent],
  template: `
    <app-layout>
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-bold text-gray-900">Customers</h2>
            <p class="text-gray-500 mt-1">Manage your customer relationships</p>
          </div>
          <button (click)="showCreateModal = true"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Customer
          </button>
        </div>

        <!-- Search -->
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input [(ngModel)]="searchTerm"
                 class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                 placeholder="Search customers...">
        </div>

        <!-- Customer Table -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let customer of filteredCustomers" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span class="text-indigo-700 font-medium">{{ customer.name[0] | uppercase }}</span>
                    </div>
                    <span class="font-medium text-gray-900">{{ customer.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-600">{{ customer.email || '-' }}</td>
                <td class="px-6 py-4 text-gray-600">{{ customer.phone || '-' }}</td>
                <td class="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">{{ customer.notes || '-' }}</td>
                <td class="px-6 py-4 text-right">
                  <button (click)="deleteCustomer(customer)"
                          class="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </td>
              </tr>
              <tr *ngIf="filteredCustomers.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  <div *ngIf="searchTerm">No customers found matching "{{ searchTerm }}"</div>
                  <div *ngIf="!searchTerm">No customers yet. Add your first customer!</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create Customer Modal -->
      <div *ngIf="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Add Customer</h3>
          <form (ngSubmit)="createCustomer()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input [(ngModel)]="newCustomer.name" name="name" required
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                       placeholder="John Doe">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input [(ngModel)]="newCustomer.email" name="email" type="email"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                       placeholder="john@example.com">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input [(ngModel)]="newCustomer.phone" name="phone"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                       placeholder="+1 234 567 8900">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea [(ngModel)]="newCustomer.notes" name="notes"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          rows="3" placeholder="Additional notes..."></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" (click)="showCreateModal = false"
                      class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Add Customer
              </button>
            </div>
          </form>
        </div>
      </div>
    </app-layout>
  `,
  styles: []
})
export class CustomersComponent implements OnInit {
  private businessService = inject(BusinessService);
  private customerService = inject(CustomerService);

  customers: Customer[] = [];
  showCreateModal = false;
  searchTerm = '';
  businessId: number | null = null;

  newCustomer: CreateCustomer = {
    name: '',
    email: '',
    phone: '',
    notes: ''
  };

  get filteredCustomers(): Customer[] {
    if (!this.searchTerm) return this.customers;
    const term = this.searchTerm.toLowerCase();
    return this.customers.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone?.includes(term)
    );
  }

  ngOnInit() {
    this.businessService.loadProfile().subscribe(profile => {
      if (profile?.businessId) {
        this.businessId = profile.businessId;
        this.customerService.loadCustomers(profile.businessId).subscribe(customers => this.customers = customers);
      }
    });
  }

  createCustomer() {
    if (!this.businessId || !this.newCustomer.name) return;

    this.customerService.createCustomer(this.businessId, this.newCustomer).subscribe(() => {
      this.showCreateModal = false;
      this.newCustomer = { name: '', email: '', phone: '', notes: '' };
      this.customerService.loadCustomers(this.businessId!).subscribe(customers => this.customers = customers);
    });
  }

  deleteCustomer(customer: Customer) {
    if (!this.businessId || !confirm(`Delete ${customer.name}?`)) return;
    this.customerService.deleteCustomer(this.businessId, customer.id).subscribe(() => {
      this.customerService.loadCustomers(this.businessId!).subscribe(customers => this.customers = customers);
    });
  }
}
