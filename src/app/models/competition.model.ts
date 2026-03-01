/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

// Competition enums matching backend
export enum CompetitionTeamsType {
  Clubs = 0,
  NationalTeams = 1
}

export enum CompetitionType {
  League = 0,
  Cup = 1,
  Continental = 2
}

// Competition model for managing competitions under nations or continents
export interface Competition {
  competitionID?: string;
  competitionName: string;
  nationID?: string;
  continentID?: string;
  priority?: number;
  competitionTeamsType?: CompetitionTeamsType;
  competitionType?: CompetitionType;
  teams?: Team[];
}

export interface Team {
  teamID?: string;
  name: string;
  country?: string;
  stadium?: string;
  foundedYear?: number;
}

export interface CompetitionPayload {
  CompetitionName: string;
  NationID?: string;
  ContinentID?: string;
  CompetitionTeamsType: CompetitionTeamsType;
  Priority: number;
  CompetitionType: CompetitionType;
}

