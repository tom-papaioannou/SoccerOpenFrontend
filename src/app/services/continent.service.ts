/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { IContinent } from '../models/continent.model';

@Injectable({ providedIn: 'root' })
export class ContinentService {
  constructor(private http: HttpClient) {}

  private buildUrl(segment?: string): string {
    const base = `${environment.apiUrl}/api/Continent`;
    return segment ? `${base}/${segment}` : base;
  }

  loadAll(): Observable<IContinent[]> {
    return this.http.get<IContinent[]>(this.buildUrl('getAllContinents'));
  }
}
