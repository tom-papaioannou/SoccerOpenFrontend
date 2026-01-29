import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TacticsService {
  
  constructor(private readonly http: HttpClient) {}

  getTeamTactics(teamID: string): Observable<any>{
    return this.http.get(`${environment.apiUrl}/api/tactics/getTeamTactics/${teamID}`);
  }
}
