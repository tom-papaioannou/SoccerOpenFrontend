/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AuthService } from './services/auth.service';
import { DeviceService } from './services/device.service';
import { Router } from '@angular/router';
import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';

describe('App', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDeviceService: jasmine.SpyObj<DeviceService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let authenticationChangeEmitter: EventEmitter<any>;

  beforeEach(async () => {
    authenticationChangeEmitter = new EventEmitter();
    
    mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getRole', 'logOut'], {
      authenticationChange: authenticationChangeEmitter
    });
    mockDeviceService = jasmine.createSpyObj('DeviceService', [], {
      isMobile$: of(false)
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService.logOut.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: DeviceService, useValue: mockDeviceService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should use authService.isLoggedIn() to check authentication on initialization', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.getRole.and.returnValue('admin');

    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(mockAuthService.isLoggedIn).toHaveBeenCalled();
    expect(app.signedIn).toBe(true);
  });

  it('should use authService.getRole() when user is signed in', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.getRole.and.returnValue('admin');

    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(mockAuthService.getRole).toHaveBeenCalled();
    expect(app.role).toBe('admin');
  });

  it('should not call getRole() when user is not signed in', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);

    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(mockAuthService.getRole).not.toHaveBeenCalled();
  });

  it('should set signedIn to false when token is expired', () => {
    // Simulate expired token scenario
    mockAuthService.isLoggedIn.and.returnValue(false);

    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.signedIn).toBe(false);
  });

  it('should update authentication state when authenticationChange emits', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    mockAuthService.getRole.and.returnValue('');

    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    // Initially not signed in
    expect(app.signedIn).toBe(false);

    // Simulate user logging in
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.getRole.and.returnValue('user');
    authenticationChangeEmitter.emit();
    fixture.detectChanges();

    // Should now be signed in
    expect(app.signedIn).toBe(true);
    expect(app.role).toBe('user');
  });

  it('should navigate to login when logOut is called', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.getRole.and.returnValue('admin');

    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.logOut();

    expect(mockAuthService.logOut).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
