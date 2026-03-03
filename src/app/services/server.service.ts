/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { IServer, IServerInfo } from '../models/server.model';

@Injectable({ providedIn: 'root' })
export class ServerService {
  constructor(private http: HttpClient) {}

  private buildUrl(segment?: string): string {
    const base = `${environment.apiUrl}/api/Servers`;
    return segment ? `${base}/${segment}` : base;
  }

  getAllServers(): Observable<IServer[]> {
    return this.http.get<IServer[]>(this.buildUrl('getAllServers'));
  }

  getUserServer(userID: string): Observable<string> {
    return this.http.get<string>(this.buildUrl(`getUserServer/${userID}`));
  }

  createNewServer(name: string): Observable<IServer> {
    return this.http.post<IServer>(this.buildUrl('createNewServer'), { name });
  }

  getServerInformation(serverID: string): Observable<IServerInfo> {
    return this.http.get<IServerInfo>(this.buildUrl(`getServerInformation/${serverID}`));
  }
}
