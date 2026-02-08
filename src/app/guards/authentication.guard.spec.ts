import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authenticationGuard } from './authentication.guard';
import { AuthService } from '../services/auth.service';

describe('authenticationGuard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('should allow access when user is logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authenticationGuard({} as any, { url: '/home' } as any)
    );

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authenticationGuard({} as any, { url: '/home' } as any)
    );

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/home' }
    });
  });
});
