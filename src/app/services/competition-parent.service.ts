import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CompetitionParent, CreateCompetitionParentRequest } from '../models/competition-parent.model';

@Injectable({
  providedIn: 'root'
})
export class CompetitionParentService {
  private readonly apiUrl = `${environment.apiUrl}/api/CompetitionParent`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Get a specific competition parent by ID
   * Backend endpoint: GET /api/CompetitionParent/{competitionParentID}
   */
  getCompetitionParent(competitionParentID: string): Observable<CompetitionParent> {
    return this.http.get<CompetitionParent>(`${this.apiUrl}/${competitionParentID}`).pipe(
      catchError(this.handleError),
      shareReplay(1)
    );
  }

  /**
   * Get all competition parents
   * Backend endpoint: GET /api/CompetitionParent
   */
  getAllCompetitionParents(): Observable<CompetitionParent[]> {
    return this.http.get<CompetitionParent[]>(this.apiUrl).pipe(
      catchError(this.handleError),
      shareReplay(1)
    );
  }

  /**
   * Create a new competition parent
   * Backend endpoint: POST /api/CompetitionParent
   */
  createCompetitionParent(competitionParent: CreateCompetitionParentRequest): Observable<CompetitionParent> {
    return this.http.post<CompetitionParent>(this.apiUrl, competitionParent).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing competition parent
   * Backend endpoint: PUT /api/CompetitionParent/{competitionParentID}
   */
  updateCompetitionParent(competitionParentID: string, competitionParent: CreateCompetitionParentRequest): Observable<CompetitionParent> {
    return this.http.put<CompetitionParent>(`${this.apiUrl}/${competitionParentID}`, competitionParent).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete a competition parent
   * Backend endpoint: DELETE /api/CompetitionParent/{competitionParentID}
   */
  deleteCompetitionParent(competitionParentID: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${competitionParentID}`).pipe(
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
    
    console.error('CompetitionParentService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
