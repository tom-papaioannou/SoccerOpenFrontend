/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PlayerRole } from '../models/player-enums.model';
import { Tactic, CreateTacticRequest, PlayerTactic, AddPlayerTacticRequest, UpdatePlayerTacticRoleRequest, UpdateTacticRequest } from '../models/tactic.model';

@Injectable({
  providedIn: 'root'
})
export class TacticsService {
  private readonly apiUrl = `${environment.apiUrl}/api/tactics`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Get all tactics for a team
   * Backend endpoint: GET /api/tactics/getTeamTactics/{teamID}
   */
  getTeamTactics(): Observable<Tactic[]> {
    return this.http.get<Tactic[]>(`${this.apiUrl}/getTeamTactics`).pipe(
      catchError(this.handleError),
      shareReplay(1)
    );
  }

  /**
   * Get a specific tactic by ID
   * Backend endpoint: GET /api/tactics/getTeamTactic/{tacticID}
   */
  getTeamTactic(tacticID: string): Observable<Tactic> {
    return this.http.get<Tactic>(`${this.apiUrl}/getTeamTactic/${tacticID}`).pipe(
      catchError(this.handleError),
      shareReplay(1)
    );
  }

  /**
   * Create a new team tactic
   * Backend endpoint: POST /api/tactics/createTeamTactic
   */
  createTeamTactic(tactic: CreateTacticRequest): Observable<Tactic> {
    return this.http.post<Tactic>(`${this.apiUrl}/createTeamTactic`, tactic).pipe(
      catchError(this.handleError)
    );
  }

  updateTeamTactic(tacticID: string, tactic: UpdateTacticRequest): Observable<Tactic> {
    return this.http.put<Tactic>(`${this.apiUrl}/updateTeamTactic/${tacticID}`, tactic).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get player tactics for a specific tactic
   * Backend endpoint: GET /api/tactics/getPlayerTactics/{tacticID}
   */
  getPlayerTactics(tacticID: string): Observable<PlayerTactic[]> {
    return this.http.get<PlayerTactic[]>(`${this.apiUrl}/getPlayerTactics/${tacticID}`).pipe(
      catchError(this.handleError),
      shareReplay(1)
    );
  }

  /**
   * Add a player to a tactic
   * Backend endpoint: POST /api/tactics/addPlayerTactic
   */
  addPlayerTactic(playerTactic: AddPlayerTacticRequest): Observable<PlayerTactic> {
    return this.http.post<PlayerTactic>(`${this.apiUrl}/addPlayerTactic`, playerTactic).pipe(
      catchError(this.handleError)
    );
  }

  updateStartingPlayerRole(teamID: string, playerTacticID: string, playerRole: PlayerRole): Observable<PlayerTactic> {
    const request: UpdatePlayerTacticRoleRequest = { playerRole };

    return this.http.patch<PlayerTactic>(
      `${this.apiUrl}/teams/${teamID}/starting-player-tactics/${playerTacticID}/role`,
      request
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete a tactic
   * Backend endpoint: DELETE /api/tactics/deleteTactic/{tacticID}
   */
  deleteTactic(tacticID: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteTeamTactic/${tacticID}`).pipe(
      catchError(this.handleError)
    );
  }

  swapPlayerTactics(firstPersonTacticID: string, secondPersonTacticID: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/swapPlayersTactics`, { firstPersonTacticID: firstPersonTacticID, secondPersonTacticID: secondPersonTacticID }).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error (${error.status}): ${error.message}`;
      if (typeof error.error === 'string' && error.error.trim()) {
        errorMessage = error.error;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('TacticsService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
