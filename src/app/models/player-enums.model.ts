/**
 * PlayerPosition enum matching backend
 */
export enum PlayerPosition {
  None = 0,
  Goalkeeper = 1,
  RightBack = 2,
  LeftBack = 3,
  CenterBack = 4,
  DefensiveMidfielder = 5,
  RightWingBack = 6,
  LeftWingBack = 7,
  CentralMidfielder = 8,
  RightMidfielder = 9,
  LeftMidfielder = 10,
  AttackingMidfielder = 11,
  RightWinger = 12,
  LeftWinger = 13,
  Striker = 14
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
 * Person model representing a person's basic information
 */
export interface Person {
  PersonID: string;
  Name?: string;
  Surname?: string;
  DateOfBirth?: string;
  PlaceOfBirth?: string;
  ContractID?: string;
}

/**
 * Player model representing a player
 */
export interface Player {
  PlayerID: string;
  PersonID: string;
  Person?: Person;
}
