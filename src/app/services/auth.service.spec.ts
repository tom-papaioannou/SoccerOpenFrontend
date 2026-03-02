/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment.development';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRole', () => {
    it('should return empty string when no token exists', () => {
      const role = service.getRole();
      expect(role).toBe('');
    });

    it('should extract role from JWT token', () => {
      // Create a mock JWT token with role "admin"
      // Header: {"alg":"HS256","typ":"JWT"}
      // Payload: {"role":"admin","exp":9999999999}
      // This is a dummy token for testing purposes only
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJleHAiOjk5OTk5OTk5OTl9.placeholder';
      
      localStorage.setItem('token', mockToken);
      service = TestBed.inject(AuthService); // Reinitialize to pick up the token
      
      const role = service.getRole();
      expect(role).toBe('admin');
    });

    it('should extract role "user" from JWT token', () => {
      // Create a mock JWT token with role "user"
      // Payload: {"role":"user","exp":9999999999}
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsImV4cCI6OTk5OTk5OTk5OX0.placeholder';
      
      localStorage.setItem('token', mockToken);
      service = TestBed.inject(AuthService);
      
      const role = service.getRole();
      expect(role).toBe('user');
    });

    it('should return empty string when role is not in token', () => {
      // Create a mock JWT token without role
      // Payload: {"exp":9999999999}
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.placeholder';
      
      localStorage.setItem('token', mockToken);
      service = TestBed.inject(AuthService);
      
      const role = service.getRole();
      expect(role).toBe('');
    });
  });

  describe('afterSuccessfulLogin', () => {
    it('should not store role in localStorage', () => {
      const result = { role: 'admin', token: 'some-token' };
      
      service.afterSuccessfulLogin(result);
      
      expect(localStorage.getItem('role')).toBeNull();
    });

    it('should set loggedIn to true', () => {
      const result = { role: 'admin', token: 'some-token' };
      
      service.afterSuccessfulLogin(result);
      
      expect(service.loggedIn).toBe(true);
    });

    it('should emit authentication change', (done) => {
      const result = { role: 'admin', token: 'some-token' };
      
      service.authenticationChange.subscribe(() => {
        done();
      });
      
      service.afterSuccessfulLogin(result);
    });
  });

  describe('getUserID', () => {
    it('should return empty string when no token exists', () => {
      const userID = service.getUserID();
      expect(userID).toBe('');
    });

    it('should extract user ID from JWT sub claim', () => {
      // Payload: {"sub":"test-user-id-123","exp":9999999999}
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQtMTIzIiwiZXhwIjo5OTk5OTk5OTk5fQ.placeholder';

      localStorage.setItem('token', mockToken);
      service = TestBed.inject(AuthService);

      const userID = service.getUserID();
      expect(userID).toBe('test-user-id-123');
    });

    it('should return empty string when sub is not in token', () => {
      // Payload: {"exp":9999999999}
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.placeholder';

      localStorage.setItem('token', mockToken);
      service = TestBed.inject(AuthService);

      const userID = service.getUserID();
      expect(userID).toBe('');
    });
  });

  describe('clearToken', () => {
    it('should remove token from localStorage', () => {
      localStorage.setItem('token', 'some-token');
      
      service.clearToken();
      
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should remove role from localStorage if it exists', () => {
      localStorage.setItem('token', 'some-token');
      localStorage.setItem('role', 'admin');
      
      service.clearToken();
      
      expect(localStorage.getItem('role')).toBeNull();
    });

    it('should emit authentication change', (done) => {
      service.authenticationChange.subscribe(() => {
        done();
      });
      
      service.clearToken();
    });
  });

  describe('fetchAndStoreServerID', () => {
    it('should not make HTTP call when no token exists', () => {
      service.fetchAndStoreServerID();
      httpMock.expectNone((req) => req.url.includes('getUserServer'));
      expect(service.currentServerID).toBeNull();
    });

    it('should fetch and store server ID for logged-in user', () => {
      // Payload: {"sub":"user-abc","exp":9999999999}
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWFiYyIsImV4cCI6OTk5OTk5OTk5OX0.placeholder';
      localStorage.setItem('token', mockToken);
      service = TestBed.inject(AuthService);

      service.fetchAndStoreServerID();

      const req = httpMock.expectOne(`${environment.apiUrl}/api/Servers/getUserServer/user-abc`);
      expect(req.request.method).toBe('GET');
      req.flush('server-id-456');

      expect(service.currentServerID).toBe('server-id-456');
    });
  });
});
