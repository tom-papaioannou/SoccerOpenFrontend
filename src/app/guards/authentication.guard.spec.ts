/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authenticationGuard } from './authentication.guard';
import { AuthService } from '../services/auth.service';
import { of, throwError, Observable } from 'rxjs';

describe('authenticationGuard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'hasValidAccessToken',
      'hasRefreshToken',
      'refreshToken',
      'clearToken'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('should allow access when access token is valid', () => {
    mockAuthService.hasValidAccessToken.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authenticationGuard({} as any, { url: '/home' } as any)
    );

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should refresh and allow access when access token expired but refresh succeeds', (done) => {
    mockAuthService.hasValidAccessToken.and.returnValue(false);
    mockAuthService.hasRefreshToken.and.returnValue(true);
    mockAuthService.refreshToken.and.returnValue(of({ token: 'new-token', role: 'user' }));

    const result = TestBed.runInInjectionContext(() =>
      authenticationGuard({} as any, { url: '/home' } as any)
    );

    (result as Observable<boolean>).subscribe(value => {
      expect(value).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should clear auth and redirect when refresh fails', (done) => {
    mockAuthService.hasValidAccessToken.and.returnValue(false);
    mockAuthService.hasRefreshToken.and.returnValue(true);
    mockAuthService.refreshToken.and.returnValue(throwError(() => new Error('refresh failed')));

    const result = TestBed.runInInjectionContext(() =>
      authenticationGuard({} as any, { url: '/home' } as any)
    );

    (result as Observable<boolean>).subscribe(value => {
      expect(value).toBe(false);
      expect(mockAuthService.clearToken).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/home' }
      });
      done();
    });
  });

  it('should redirect to login when no token exists', () => {
    mockAuthService.hasValidAccessToken.and.returnValue(false);
    mockAuthService.hasRefreshToken.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authenticationGuard({} as any, { url: '/home' } as any)
    );

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/home' }
    });
  });
});
