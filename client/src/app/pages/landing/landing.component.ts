import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Navigation -->
      <nav class="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
                </svg>
              </div>
              <span class="font-bold text-xl">WorkFlow</span>
            </div>
            <div class="flex items-center gap-4">
              <button (click)="login()" class="text-sm font-medium text-gray-600 hover:text-gray-900">
                Log in
              </button>
              <button (click)="login()"
                      class="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="pt-32 pb-16 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div class="text-center space-y-8">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold border border-indigo-100">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            v2.0 is now live
          </div>

          <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 max-w-4xl mx-auto leading-tight">
            The mobile notebook <br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
              for modern business.
            </span>
          </h1>

          <p class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Manage tasks, collect data forms, and track customers in one unified platform.
            Designed for field teams and office managers alike.
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button (click)="login()"
                    class="px-8 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-2">
              Start for free
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </button>
            <button class="px-8 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors">
              View demo
            </button>
          </div>
        </div>
      </section>

      <!-- Features Grid -->
      <section class="py-24 bg-gray-50 border-t border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold text-gray-900">Everything you need</h2>
            <p class="mt-4 text-gray-600">Powerful features to run your business efficiently.</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Task Management</h3>
              <p class="text-gray-600">Create, assign, and track tasks with priorities and due dates.</p>
            </div>

            <div class="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Customer Tracking</h3>
              <p class="text-gray-600">Keep all your customer information organized in one place.</p>
            </div>

            <div class="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Custom Forms</h3>
              <p class="text-gray-600">Build dynamic forms to collect data from your team.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-12 border-t border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          © 2026 WorkFlow. Built with Angular.
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class LandingPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  login() {
    this.authService.login();
  }
}
