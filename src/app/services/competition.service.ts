/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Competition, CompetitionPayload } from '../models/competition.model';

@Injectable({ providedIn: 'root' })
export class CompetitionService {
  private apiUrl = environment.apiUrl + '/api/Competitions';

  constructor(private http: HttpClient) {}

  getByNation(nationId: string): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.apiUrl}/getByNation/${nationId}`);
  }

  getByContinent(continentId: string): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.apiUrl}/getByContinent/${continentId}`);
  }

  getById(competitionId: string): Observable<Competition> {
    return this.http.get<Competition>(`${this.apiUrl}/${competitionId}`);
  }

  create(payload: CompetitionPayload): Observable<Competition> {
    return this.http.post<Competition>(this.apiUrl, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
