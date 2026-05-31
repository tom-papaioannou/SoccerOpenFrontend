/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

// Competition enums matching backend
export enum CompetitionTeamsType {
  None = 0,
  NationalTeams = 1,
  Clubs = 2
}

export enum CompetitionType {
  None = 0,
  League = 1,
  Knockout = 2,
  Mixed = 3
}

// Competition model for managing competitions under nations or continents
export interface Competition {
  competitionID?: string;
  competitionName: string;
  nationID?: string;
  continentID?: string;
  nation?: CompetitionParent | null;
  continent?: CompetitionParent | null;
  priority?: number;
  competitionTeamsType?: CompetitionTeamsType;
  competitionType?: CompetitionType;
  teams?: Team[];
}

export interface CompetitionParent {
  name?: string | null;
}

export interface TeamCompetitions {
  teamID: string;
  competitions: Competition[];
}

export interface Team {
  teamID?: string;
  name: string;
  leagueID?: string | null;
  leagueName?: string | null;
  isOwned?: boolean;
  stadium?: Stadium;
  kit: Kit;
}

export interface Kit {
  homeShirtColor: string;
  homeShortsColor: string;
  awayShirtColor: string;
  awayShortsColor: string;
}

export interface Stadium {
  stadiumID?: string;
  name: string;
  city?: string;
  latitude: number;
  longitude: number;
  capacity: number;
}

export interface CompetitionPayload {
  CompetitionName: string;
  NationID?: string;
  ContinentID?: string;
  CompetitionTeamsType: CompetitionTeamsType;
  Priority: number;
  CompetitionType: CompetitionType;
  ServerID?: string | null;
}

