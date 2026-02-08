import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Tactic, CreateTacticRequest, PlayerTactic, AddPlayerTacticRequest } from '../models/tactic.model';

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
  getTeamTactics(teamID: string): Observable<Tactic[]> {
    return this.http.get<Tactic[]>(`${this.apiUrl}/getTeamTactics/${teamID}`).pipe(
      catchError(this.handleError),
      shareReplay(1)
    );
  }

  getTeamTactic(tacticID: string): Observable<Tactic[]> {
    return this.http.get<Tactic[]>(`${this.apiUrl}/getTeamTactic/${tacticID}`).pipe(
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

  /**
   * Delete a tactic
   * Backend endpoint: DELETE /api/tactics/deleteTactic/{tacticID}
   */
  deleteTactic(tacticID: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteTeamTactic/${tacticID}`).pipe(
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
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('TacticsService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
