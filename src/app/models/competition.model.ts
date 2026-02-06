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

// Competition model for managing competitions under parent organizations
export interface Competition {
  competitionID?: string;
  name: string;
  competitionParentID: string;
  priority?: number;
  competitionTeamsType?: CompetitionTeamsType;
  competitionType?: CompetitionType;
}

export interface CompetitionPayload {
  CompetitionName: string;
  ParentID: string;
  CompetitionTeamsType: CompetitionTeamsType;
  Priority: number;
  CompetitionType: CompetitionType;
}

