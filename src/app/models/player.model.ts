/**
 * PlayerPosition enum matching backend
 */
export enum PlayerPosition {
  None = 0,
  GK = 1,
  CD = 2,
  DL = 3,
  DR = 4,
  DM = 5,
  MC = 6,
  ML = 7,
  MR = 8,
  CF = 9
}

/**
 * PlayerRole enum matching backend
 */
export enum PlayerRole {
  None = 0,
  Starter = 1,
  Substitute = 2,
  Reserve = 3
}

/**
 * Player model representing a player in the team
 */
export interface Player {
  playerID: string;
  firstName: string;
  lastName: string;
  age: number;
  position?: PlayerPosition;
}
