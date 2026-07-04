/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Kit, Stadium } from './competition.model';

export interface JoinableServer {
  serverID: string;
  name: string;
}

export interface RegistrationAvailability {
  isAvailable: boolean;
  message: string;
}

export interface RegistrationNation {
  nationID: string;
  name: string;
  iso2: string;
  iso3?: string | null;
  flagUrl?: string | null;
}

export interface RegistrationTeam {
  teamID: string;
  name?: string | null;
  code: string;
  competitionID: string;
  competitionName?: string | null;
  nationID: string;
  nationName: string;
  isAvailable: boolean;
  badgeUrl?: string | null;
  stadium?: Stadium | null;
  kit?: Kit | null;
}

export interface CompleteRegistrationRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  serverID: string;
  nationID: string;
  teamID: string;
}

export interface CompleteRegistrationResponse {
  token: string;
  role: string;
  serverID: string;
  teamID: string;
  teamName?: string | null;
}

export interface AdminHostRegistrationRequest {
  username: string;
  password: string;
  serverID: string;
}

export interface AuthRegistrationResponse {
  token: string;
  role: string;
}

export interface RegistrationApiError {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
}
