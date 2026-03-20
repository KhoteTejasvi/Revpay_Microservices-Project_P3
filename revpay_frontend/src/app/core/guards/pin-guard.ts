import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PinService } from '../services/pin.service';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const pinGuard: CanActivateFn = () => {
  const pinService = inject(PinService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return of(false);
  }

  // Admin doesn't need a transaction PIN
  if (authService.userRole() === 'ADMIN') {
    return of(true);
  }

  return pinService.getPinStatus().pipe(
    map(status => {
      if (!status.pinSet) {
        const role = authService.userRole();
        router.navigate([role === 'BUSINESS' ? '/business/set-pin' : '/personal/set-pin']);
        return false;
      }
      return true;
    }),
    catchError((err) => {
      // If 401/403, send to login. Otherwise block and redirect to set-pin.
      const status = err?.status;
      if (status === 401 || status === 403) {
        router.navigate(['/auth/login']);
        return of(false);
      }
      // On any other error, redirect to set-pin to be safe
      const role = authService.userRole();
      router.navigate([role === 'BUSINESS' ? '/business/set-pin' : '/personal/set-pin']);
      return of(false);
    })
  );
};
