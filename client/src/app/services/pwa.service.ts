import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { BehaviorSubject, filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private swUpdate = inject(SwUpdate, { optional: true });

  private onlineStatus = new BehaviorSubject<boolean>(navigator.onLine);
  isOnline$ = this.onlineStatus.asObservable();

  private updateAvailable = new BehaviorSubject<boolean>(false);
  updateAvailable$ = this.updateAvailable.asObservable();

  constructor() {
    this.initOnlineStatus();
    this.initServiceWorkerUpdates();
  }

  private initOnlineStatus() {
    window.addEventListener('online', () => this.onlineStatus.next(true));
    window.addEventListener('offline', () => this.onlineStatus.next(false));
  }

  private initServiceWorkerUpdates() {
    if (!this.swUpdate?.isEnabled) return;

    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        map(evt => ({
          current: evt.currentVersion,
          available: evt.latestVersion
        }))
      )
      .subscribe(() => {
        this.updateAvailable.next(true);
      });
  }

  checkForUpdate() {
    if (this.swUpdate?.isEnabled) {
      this.swUpdate.checkForUpdate();
    }
  }

  updateApp() {
    if (this.swUpdate?.isEnabled) {
      this.swUpdate.activateUpdate().then(() => {
        window.location.reload();
      });
    }
  }

  get isOnline(): boolean {
    return this.onlineStatus.value;
  }
}
