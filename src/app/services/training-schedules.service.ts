import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import {
  CreateTrainingScheduleRequest,
  TrainingSchedule,
  TrainingScheduleCoach,
  UpdateTrainingScheduleRequest
} from '../models/training-schedule.model';

@Injectable({ providedIn: 'root' })
export class TrainingSchedulesService {
  private readonly apiUrl = `${environment.apiUrl}/api/training-schedules`;

  constructor(private readonly http: HttpClient) {}

  getTeamTrainingSchedules(): Observable<TrainingSchedule[]> {
    return this.http.get<TrainingSchedule[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  createTrainingSchedule(request: CreateTrainingScheduleRequest): Observable<TrainingSchedule> {
    return this.http.post<TrainingSchedule>(this.apiUrl, request).pipe(catchError(this.handleError));
  }

  getTeamCoaches(): Observable<TrainingScheduleCoach[]> {
    return this.http.get<TrainingScheduleCoach[]>(`${this.apiUrl}/coaches`).pipe(catchError(this.handleError));
  }

  updateTrainingScheduleCoach(scheduleID: string, coachID: string): Observable<TrainingSchedule> {
    return this.http.put<TrainingSchedule>(`${this.apiUrl}/${scheduleID}/coach`, { coachID }).pipe(
      catchError(this.handleError)
    );
  }

  updateTrainingSchedule(
    scheduleID: string,
    request: UpdateTrainingScheduleRequest
  ): Observable<TrainingSchedule> {
    return this.http.put<TrainingSchedule>(`${this.apiUrl}/${scheduleID}`, request).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message = typeof error.error === 'string' && error.error.trim()
      ? error.error
      : error.error?.title || error.message || 'An unknown error occurred';

    return throwError(() => new Error(message));
  }
}
