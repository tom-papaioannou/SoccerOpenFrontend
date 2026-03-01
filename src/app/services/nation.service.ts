/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { INation } from '../models/nation.model';

@Injectable({ providedIn: 'root' })
export class NationService {
  constructor(private http: HttpClient) {}

  private buildUrl(segment?: string): string {
    const base = `${environment.apiUrl}/api/Nation`;
    return segment ? `${base}/${segment}` : base;
  }

  getByContinent(continentId: string): Observable<INation[]> {
    return this.http.get<INation[]>(this.buildUrl(`getNationsByContinent/${continentId}`));
  }
}
