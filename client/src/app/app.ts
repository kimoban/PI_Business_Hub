import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OfflineIndicatorComponent } from './components/offline-indicator/offline-indicator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OfflineIndicatorComponent],
  template: `
    <app-offline-indicator></app-offline-indicator>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class App {}
