import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable, ReplaySubject } from 'rxjs';
import { Team } from '../models/competition.model';
import { Player } from '../models/player-enums.model';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  private readonly apiUrl = `${environment.apiUrl}/api/tactics`;
  private currentTeam: Team | undefined;
  private currentTeam$ = new ReplaySubject<Team>(1);

  get CurrentTeam(){
    return this.currentTeam;
  }

  set CurrentTeam(team: Team | undefined){
    this.currentTeam = team;
    if (team) {
      this.currentTeam$.next(team);
    }
  }

  get currentTeamObservable(): Observable<Team> {
    return this.currentTeam$.asObservable();
  }

  constructor(private readonly http: HttpClient) {}

  getCurrentTeam(): Observable<any>{
    return this.http.get(`${environment.apiUrl}/api/teams/getCurrentTeam`);
  }

  getTeamPlayers(teamID: string): Observable<Player[]> {
    return this.http.get<Player[]>(`${environment.apiUrl}/api/teams/getTeamPlayers/${teamID}`);
  }
}
