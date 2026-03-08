/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';
import { ServerService } from './server.service';

type JwtPayload = { exp?: number; role?: string; };

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authenticationChange = new EventEmitter<any>();
  loggedIn = localStorage.getItem("token") !== null;
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  token$ = this.tokenSubject.asObservable();
  currentServerID: string | null = null;
  private serverSubject = new BehaviorSubject<string | null>(localStorage.getItem('serverID'));
  server$ = this.serverSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly serverService: ServerService
  ) {}

  get token(): string | null {
    return this.tokenSubject.value;
  }

  isLoggedIn(): boolean {
    const t = this.token;
    if (!t){
      return false;
    }
    return !this.isTokenExpired(t);
  }

  getRole(): string {
    const t = this.token;
    if (!t) return '';
    const payload = jwtDecode<any>(t);
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return (role as any) ?? '';
  }

  getUserID(): string {
    const t = this.token;
    if (!t) return '';
    const payload = jwtDecode<any>(t);
    return payload['sub'] ?? '';
  }

  fetchAndStoreServerID(): void {
    const userID = this.getUserID();
    if (!userID) return;
    this.serverService.getUserServer(userID).pipe(take(1)).subscribe({
      next: (serverID) => {
        this.currentServerID = serverID;
        localStorage.setItem('serverID', this.currentServerID);
        this.serverSubject.next(this.currentServerID);
      },
      error: (err) => {
        console.error('Failed to fetch user server', err);
      }
    });
  }

  private isTokenExpired(token: string): boolean {
    const payload = jwtDecode<JwtPayload>(token);
    if (!payload.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  }

  testConnection(): Observable<any>{
    return this.http.get(`${environment.apiUrl}/api/test/connection`);
  }

  login(username: string, password: string) {
    return this.http.post<{ token: string; role: string }>(`${environment.apiUrl}/api/auth/login`, { username, password }, { withCredentials: true }).pipe(
      tap(res => {
        this.setToken(res.token);
      })
    );
  }

  refresh(): Observable<{ token: string; role: string }> {
    return this.http.post<{ token: string; role: string }>(`${environment.apiUrl}/api/auth/refresh`, {}, { withCredentials: true }).pipe(
      tap(res => this.setToken(res.token))
    );
  }

  register(data: any): Observable<any>{
    return this.http.post<{ token: string }>(`${environment.apiUrl}/api/auth/register`, data);
  }

  emitChange(){
    this.authenticationChange.emit();
  }

  afterSuccessfulLogin(result: any){
    this.loggedIn = true;
    this.emitChange();
  }

  logOut() {
    return this.http.post(`${environment.apiUrl}/api/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearToken())
    );
  }

  private setToken(token: string) {
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
  }

  public clearToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.tokenSubject.next(null);
    this.emitChange();
  }
}
