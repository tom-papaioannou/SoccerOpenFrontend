import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Tactic, CreateTacticRequest, UpdateTacticRequest } from '../models/tactic.model';

@Injectable({
  providedIn: 'root'
})
export class TacticsService {
  private readonly apiUrl = `${environment.apiUrl}/api/tactics`;
  private readonly refreshSubject = new BehaviorSubject<void>(undefined);

  constructor(private readonly http: HttpClient) {}

  /**
   * Get all tactics for a team
   */
  getTactics(teamId: string): Observable<Tactic[]> {
    return this.http.get<Tactic[]>(`${this.apiUrl}/team/${teamId}`).pipe(
      catchError(this.handleError),
      shareReplay(1)
    );
  }

  /**
   * Get all tactics (for listing all tactics across teams)
   */
  getAllTactics(): Observable<Tactic[]> {
    return this.http.get<Tactic[]>(this.apiUrl).pipe(
      catchError(this.handleError),
      shareReplay(1)
    );
  }

  /**
   * Get a single tactic by ID
   */
  getTactic(id: string): Observable<Tactic> {
    return this.http.get<Tactic>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create a new tactic
   */
  createTactic(tactic: CreateTacticRequest): Observable<Tactic> {
    return this.http.post<Tactic>(this.apiUrl, tactic).pipe(
      tap(() => this.invalidateCache()),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing tactic
   */
  updateTactic(id: string, tactic: UpdateTacticRequest): Observable<Tactic> {
    return this.http.put<Tactic>(`${this.apiUrl}/${id}`, tactic).pipe(
      tap(() => this.invalidateCache()),
      catchError(this.handleError)
    );
  }

  /**
   * Delete a tactic
   */
  deleteTactic(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.invalidateCache()),
      catchError(this.handleError)
    );
  }

  /**
   * Invalidate the cache to force refresh
   */
  private invalidateCache(): void {
    this.refreshSubject.next();
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

  /**
   * Legacy method for backward compatibility
   */
  getTeamTactics(teamID: string): Observable<Tactic[]>{
    return this.getTactics(teamID);
  }
}
