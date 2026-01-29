import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, filter } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.loading$.pipe(
    filter(loading => !loading),
    take(1),
    map(() => {
      if (authService.isAuthenticated) {
        return true;
      }
      return router.createUrlTree(['/']);
    })
  );
};

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.loading$.pipe(
    filter(loading => !loading),
    take(1),
    map(() => {
      if (!authService.isAuthenticated) {
        return true;
      }
      return router.createUrlTree(['/dashboard']);
    })
  );
};
