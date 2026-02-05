/**
 * Tactic model representing a team's tactical setup
 * Matches the backend Tactic entity
 */
export interface Tactic {
  tacticID?: string;
  teamID: string;
  name: string;
  isMain: boolean;
}

/**
 * DTO for creating a new tactic
 * Must include TeamID as required by backend
 */
export interface CreateTacticRequest {
  TeamID: string;
  Name: string;
  isMain: boolean;
}

/**
 * PlayerTactic model for player positioning within a tactic
 */
export interface PlayerTactic {
  PlayerTacticID?: string;
  TacticID: string;
  PlayerID?: string;
  PlayerPosition: string;
}

/**
 * DTO for adding a player to a tactic
 */
export interface AddPlayerTacticRequest {
  TacticID: string;
  PlayerID?: string;
  PlayerPosition: string;
}
