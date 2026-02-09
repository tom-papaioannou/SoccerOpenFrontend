import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Team } from '../models/competition.model';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  private readonly apiUrl = `${environment.apiUrl}/api/tactics`;
  private currentTeam: Team | undefined;

  get CurrentTeam(){
    return this.currentTeam;
  }

  set CurrentTeam(team: Team | undefined){
    this.currentTeam = team;
  }

  constructor(private readonly http: HttpClient) {}

  getCurrentTeam(): Observable<any>{
    return this.http.get(`${environment.apiUrl}/api/teams/getCurrentTeam`);
  }
}
