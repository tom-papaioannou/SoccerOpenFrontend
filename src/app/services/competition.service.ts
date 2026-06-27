/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  Competition,
  CompetitionPayload,
  CupBracket,
  CompetitionTableRow,
  TeamCompetitions
} from '../models/competition.model';

@Injectable({ providedIn: 'root' })
export class CompetitionService {
  private apiUrl = environment.apiUrl + '/api/Competitions';

  constructor(private http: HttpClient) {}

  getAllCompetitions(competitionParentID: string): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.apiUrl}/getAllCompetitions/${competitionParentID}`);
  }

  getByNation(nationId: string): Observable<Competition[]> {
    return this.getAllCompetitions(nationId);
  }

  getWorldCompetitions(): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.apiUrl}/world`);
  }

  getByContinent(continentId: string): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.apiUrl}/continent/${continentId}`);
  }

  getMyCompetitions(): Observable<TeamCompetitions> {
    return this.http.get<TeamCompetitions>(`${this.apiUrl}/my`);
  }

  getById(competitionId: string): Observable<Competition> {
    return this.http.get<Competition>(`${this.apiUrl}/${competitionId}`);
  }

  getCompetitionTable(competitionId: string): Observable<CompetitionTableRow[]> {
    return this.http.get<CompetitionTableRow[]>(`${this.apiUrl}/${competitionId}/table`);
  }

  getCupBracket(competitionId: string): Observable<CupBracket> {
    return this.http.get<CupBracket>(`${this.apiUrl}/${competitionId}/cup-bracket`);
  }

  create(payload: CompetitionPayload): Observable<Competition> {
    return this.http.post<Competition>(this.apiUrl, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
