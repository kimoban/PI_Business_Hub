import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';
import { OfflineStorageService } from '../../services/offline-storage.service';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Offline Banner -->
    <div *ngIf="!(isOnline$ | async)"
         class="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium z-50 flex items-center justify-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"/>
      </svg>
      You're offline. Changes will sync when you're back online.
      <span *ngIf="pendingChanges > 0" class="bg-yellow-600 text-yellow-100 px-2 py-0.5 rounded-full text-xs">
        {{ pendingChanges }} pending
      </span>
    </div>

    <!-- Update Available Banner -->
    <div *ngIf="updateAvailable$ | async"
         class="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
      <span>A new version is available!</span>
      <button (click)="updateApp()"
              class="bg-white text-indigo-600 px-3 py-1 rounded font-medium text-sm hover:bg-indigo-50">
        Update Now
      </button>
    </div>

    <!-- Online Status Indicator (small) -->
    <div class="fixed bottom-4 left-4 z-40">
      <div [class]="(isOnline$ | async) ? 'bg-green-500' : 'bg-yellow-500'"
           class="w-3 h-3 rounded-full animate-pulse"
           [title]="(isOnline$ | async) ? 'Online' : 'Offline'">
      </div>
    </div>
  `,
  styles: []
})
export class OfflineIndicatorComponent implements OnInit {
  private pwaService = inject(PwaService);
  private offlineStorage = inject(OfflineStorageService);

  isOnline$ = this.pwaService.isOnline$;
  updateAvailable$ = this.pwaService.updateAvailable$;
  pendingChanges = 0;

  ngOnInit() {
    this.checkPendingChanges();
    // Check periodically
    setInterval(() => this.checkPendingChanges(), 30000);
  }

  async checkPendingChanges() {
    this.pendingChanges = await this.offlineStorage.getPendingChangesCount();
  }

  updateApp() {
    this.pwaService.updateApp();
  }
}
