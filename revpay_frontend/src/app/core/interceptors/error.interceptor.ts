// import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { catchError, throwError } from 'rxjs';
// import { Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';

// export const errorInterceptor: HttpInterceptorFn = (req, next) => {
//   const router = inject(Router);
//   const authService = inject(AuthService);

//   return next(req).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401) {
//         setTimeout(()=> {
//             authService.clearSession();
//             router.navigate(['/auth/login']);
//         }, 100);
//         authService.logout();
//         router.navigate(['/auth/login']);
//       }
//       return throwError(() => error);
//     })
//   );
// };
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error:', error.status, req.url);
      // ← temporarily removed redirect so we can see the real error
      return throwError(() => error);
    })
  );
};