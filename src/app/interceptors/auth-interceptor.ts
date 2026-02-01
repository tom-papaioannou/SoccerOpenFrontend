import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const token = auth.token;
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      debugger
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }

      if (err.status !== 401) {
        return throwError(() => err);
      }

      // Don’t infinite loop
      if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh')) {
        return throwError(() => err);
      }

      // If no token, nothing to refresh
      if (!auth.token) {
        return throwError(() => err);
      }

      // naive single-flight refresh
      if (isRefreshing) {
        return throwError(() => err);
      }
      isRefreshing = true;

      return auth.refresh().pipe(
        switchMap(res => {
          debugger
          isRefreshing = false;

          const retry = req.clone({
            setHeaders: { Authorization: `Bearer ${res.token}` }
          });

          return next(retry);
        }),
        catchError(refreshErr => {
          debugger
          isRefreshing = false;
          auth.clearToken(); // optional: log out client-side
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
