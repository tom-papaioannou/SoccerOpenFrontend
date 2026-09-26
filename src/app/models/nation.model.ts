/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

export interface INation {
  nationID: string;
  name: string;
  iso2?: string;
  iso3?: string;
  iSO2?: string;
  iSO3?: string;
  isO2?: string;
  isO3?: string;
  code?: string;
  flagUrl: string | null;
  latitude?: number | null;
  longitude?: number | null;
  continentID: string;
}

export interface NationDetails extends INation {
  competitions: NationCompetition[];
  squad: NationSquadPlayer[];
}

export interface NationCompetition {
  competitionID: string;
  competitionName: string;
  nationID?: string;
  priority: number;
  competitionType: number;
  competitionTeamsType: number;
  teamsCount: number;
}

export interface NationSquadPlayer {
  personID: string;
  name?: string;
  surname?: string;
  dateOfBirth?: string;
  nationID?: string | null;
  endDate?: string | null;
  playerTrainedPositions?: { playerPosition: number; playerTrainedPositionAdaptation: number }[];
  playerTrainedRoles?: { playerPosition: number; playerRole: number; playerTrainedRoleAdaptation: number }[];
}
