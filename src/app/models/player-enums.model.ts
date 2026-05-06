/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

/**
 * PlayerPosition enum matching backend
 */
export enum PlayerPosition {
  None = 0,
  Goalkeeper = 1,
  RightBack = 2,
  RightCenterBack = 3,
  CentralCenterBack = 4,
  LeftCenterBack = 5,
  LeftBack = 6,
  RightWingBack = 7,
  RightDefensiveMidfielder = 8,
  CentralDefensiveMidfielder = 9,
  LeftDefensiveMidfielder = 10,
  LeftWingBack = 11,
  RightMidfielder = 12,
  RightCenterMidfielder = 13,
  CentralCenterMidfielder = 14,
  LeftCenterMidfielder = 15,
  LeftMidfielder = 16,
  RightWinger = 17,
  RightAttackingMidfielder = 18,
  CentralAttackingMidfielder = 19,
  LeftAttackingMidfielder = 20,
  LeftWinger = 21,
  RightStriker = 22,
  CentralStriker = 23,
  LeftStriker = 24
}

/**
 * PlayerRole enum matching backend
 */
export enum PlayerRole {
  None = 0,

  // Goalkeepers
  Goalkeeper = 1,
  SweeperKeeper = 2,

  // Defenders
  CenterBack = 10,
  BallPlayingDefender = 11,
  NoNonsenseCenterBack = 12,
  Libero = 13,
  Stopper = 14,
  Cover = 15,
  FullBack = 20,
  WingBack = 21,
  CompleteWingBack = 22,
  InvertedWingBack = 23,
  WideCenterBack = 24,

  // Defensive Midfielders
  DefensiveMidfielder = 30,
  Anchorman = 31,
  HalfBack = 32,
  DeepLyingPlaymaker = 33,
  Regista = 34,
  Volante = 35,
  SegundoVolante = 36,
  BallWinningMidfielder = 37,

  // Central Midfielders
  CentralMidfielder = 40,
  BoxToBoxMidfielder = 41,
  Mezzala = 42,
  Carrilero = 43,
  AdvancedPlaymaker = 44,
  RoamingPlaymaker = 45,

  // Wide Midfielders & Wingers
  WideMidfielder = 50,
  WidePlaymaker = 51,
  Winger = 52,
  InvertedWinger = 53,
  InsideForward = 54,
  InvertedForward = 55,
  Raumdeuter = 56,
  WideTargetMan = 57,
  DefensiveWinger = 58,

  // Attacking Midfielders
  AttackingMidfielder = 60,
  ShadowStriker = 61,
  Enganche = 62,
  Trequartista = 63,
  SecondStriker = 64,
  FalseTen = 65,
  CentralWinger = 66,

  // Forwards
  AdvancedForward = 70,
  CompleteForward = 71,
  Poacher = 72,
  TargetMan = 73,
  DeepLyingForward = 74,
  PressingForward = 75,
  DefensiveForward = 76,
  FalseNine = 77,
  TrequartistaForward = 78
}

/**
 * Person model representing a person's basic information
 */
export interface Person {
  personID: string;
  name?: string;
  surname?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  contractID?: string;
  shirtNumber?: number | null;
  playerTrainedPositions?: PlayerTrainedPosition[];
  playerTrainedRoles?: PlayerTrainedRole[];
  playerStats?: PlayerStats;
}

/**
 * Player model representing a player
 */

export interface PlayerTrainedPosition{
  playerPosition: PlayerPosition;
  playerTrainedPositionAdaptation: number;
}

export interface PlayerTrainedRole{
  playerPosition?: PlayerPosition;
  playerRole: PlayerRole;
  playerTrainedRoleAdaptation: number;
}

export interface PlayerStats {
  playerStatsID?: string;
  playerID?: string;
  shooting: number;
  passing: number;
  crossing: number;
  tackling: number;
  dribbling: number;
  control: number;
  kicking: number;
  goalkeeping: number;
  teamwork: number;
  creativity: number;
  decisions: number;
  positioning: number;
  speed: number;
  acceleration: number;
  strength: number;
  jumping: number;
  stamina: number;
}
