/**
 * Tactic model representing a team's tactical setup
 */
export interface Tactic {
  id: string;
  name: string;
  description?: string;
  formation?: string;
  teamId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * DTO for creating a new tactic
 */
export interface CreateTacticRequest {
  name: string;
  description?: string;
  formation?: string;
  teamId?: string;
}

/**
 * DTO for updating an existing tactic
 */
export interface UpdateTacticRequest {
  name?: string;
  description?: string;
  formation?: string;
}
