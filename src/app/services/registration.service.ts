/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
  JoinableServer,
  RegistrationAvailability,
  RegistrationNation,
  RegistrationTeam
} from '../models/registration.model';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly serversUrl = `${environment.apiUrl}/api/Servers`;
  private readonly registrationUrl = `${environment.apiUrl}/api/Registration`;

  constructor(private readonly http: HttpClient) {}

  getJoinableServers(): Observable<JoinableServer[]> {
    return this.http.get<JoinableServer[]>(`${this.serversUrl}/joinable`);
  }

  checkUsername(username: string): Observable<RegistrationAvailability> {
    const params = new HttpParams().set('username', username);
    return this.http.get<RegistrationAvailability>(`${this.registrationUrl}/check-username`, { params });
  }

  checkEmail(email: string): Observable<RegistrationAvailability> {
    const params = new HttpParams().set('email', email);
    return this.http.get<RegistrationAvailability>(`${this.registrationUrl}/check-email`, { params });
  }

  getNations(serverID: string): Observable<RegistrationNation[]> {
    return this.http.get<RegistrationNation[]>(`${this.serversUrl}/${serverID}/nations`);
  }

  getRegistrationTeams(serverID: string, nationID: string): Observable<RegistrationTeam[]> {
    return this.http.get<RegistrationTeam[]>(
      `${this.serversUrl}/${serverID}/nations/${nationID}/registration-teams`
    );
  }

  completeRegistration(
    request: CompleteRegistrationRequest
  ): Observable<CompleteRegistrationResponse> {
    return this.http.post<CompleteRegistrationResponse>(
      `${this.registrationUrl}/complete`,
      request,
      { withCredentials: true }
    );
  }
}
