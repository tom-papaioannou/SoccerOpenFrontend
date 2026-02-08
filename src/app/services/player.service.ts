import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private readonly apiUrl = `${environment.apiUrl}/api/players`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Get all players for a team
   * Backend endpoint: GET /api/players/getTeamPlayers/{teamID}
   */
  getTeamPlayers(teamID: string): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.apiUrl}/getTeamPlayers/${teamID}`).pipe(
      catchError(this.handleError),
      shareReplay(1)
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
    
    console.error('PlayerService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
