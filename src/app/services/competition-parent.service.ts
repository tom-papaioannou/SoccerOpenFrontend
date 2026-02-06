import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { IParentOrganization, IParentOrgPayload } from '../models/competition-parent.model';

@Injectable({ providedIn: 'root' })
export class CompetitionParentService {
  constructor(private http: HttpClient) {}

  private buildUrl(segment?: string): string {
    const base = `${environment.apiUrl}/api/CompetitionParent`;
    return segment ? `${base}/${segment}` : base;
  }

  loadAll(): Observable<IParentOrganization[]> {
    return this.http.get<IParentOrganization[]>(this.buildUrl('getAllCompetitionParents'));
  }

  save(payload: IParentOrgPayload): Observable<IParentOrganization> {
    return this.http.post<IParentOrganization>(this.buildUrl(), payload);
  }

  destroy(id: string): Observable<void> {
    return this.http.delete<void>(this.buildUrl(id));
  }
}
