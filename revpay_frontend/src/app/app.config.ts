import { ApplicationConfig, provideZonelessChangeDetection  } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { jwtInterceptor } from '../app/core/interceptors/jwt-interceptor';
import { DecimalPipe, DatePipe } from '@angular/common';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideExperimentalZonelessChangeDetection(),
    provideZonelessChangeDetection (),
    provideHttpClient(withFetch(), withInterceptors([jwtInterceptor, errorInterceptor])),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions()
    ),
    // provideHttpClient(
    //   withFetch(),
    //   withInterceptors([jwtInterceptor])
    // ),
    provideAnimationsAsync(),
    DecimalPipe,
    DatePipe
  ]
};