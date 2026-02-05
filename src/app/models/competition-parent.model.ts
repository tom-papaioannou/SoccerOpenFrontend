/**
 * CompetitionParent model representing a parent organization for competitions
 * Can be either a Nation, Continent, or World
 * Matches the backend CompetitionParent entity
 */
export interface CompetitionParent {
  competitionParentID?: string;
  name: string;
  type: 'Nation' | 'Continent' | 'World';
}

/**
 * DTO for creating a new competition parent
 */
export interface CreateCompetitionParentRequest {
  Name: string;
  Type: 'Nation' | 'Continent' | 'World';
}
