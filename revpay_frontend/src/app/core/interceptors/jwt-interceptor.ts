// import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { AuthService } from '../services/auth.service';

// export const jwtInterceptor: HttpInterceptorFn = (
//   req: HttpRequest<unknown>,
//   next: HttpHandlerFn
// ) => {
//   const authService = inject(AuthService);
//   const token = authService.getAccessToken();

//   // Skip auth endpoints
//   if (req.url.includes('/api/auth/')) {
//     return next(req);
//   }

//   if (token) {
//     const cloned = req.clone({
//       setHeaders: { Authorization: `Bearer ${token}` }
//     });
//     return next(cloned);
//   }

//   return next(req);
// };

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  console.log('JWT Interceptor - URL:', req.url, '| Token:', token ? 'EXISTS' : 'MISSING' );

  if (token) {
    const cloned = req.clone({
    // req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};