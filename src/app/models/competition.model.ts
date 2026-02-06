// Competition model for managing competitions under parent organizations
export interface Competition {
  competitionID?: string;
  name: string;
  competitionParentID: string;
  tier?: number;
}

export interface CompetitionPayload {
  Name: string;
  CompetitionParentID: string;
  Tier?: number;
}
