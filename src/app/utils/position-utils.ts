/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { PlayerPosition, PlayerRole } from '../models/player-enums.model';

/**
 * Utility functions for converting player positions and roles to display labels
 */

/**
 * Get the display label for a player position
 * @param position The PlayerPosition enum value
 * @returns The abbreviated position label (e.g., 'GK', 'CB', 'ST')
 */
export function getPlayerPositionLabel(position?: PlayerPosition): string {
  if (position === undefined || position === null) {
    return '-';
  }
  
  switch(position) {
    case PlayerPosition.Goalkeeper:
      return 'GK';
    case PlayerPosition.RightBack:
      return 'RB';
    case PlayerPosition.RightCenterBack:
      return 'RCB';
      case PlayerPosition.CentralCenterBack:
      return 'CCB';
      case PlayerPosition.LeftCenterBack:
      return 'LCB';
    case PlayerPosition.LeftBack:
      return 'LB';
    case PlayerPosition.RightWingBack:
      return 'RWB';
    case PlayerPosition.RightDefensiveMidfielder:
      return 'RDM';
    case PlayerPosition.CentralDefensiveMidfielder:
      return 'CDM';
    case PlayerPosition.LeftDefensiveMidfielder:
      return 'LDM';
    case PlayerPosition.LeftWingBack:
      return 'LWB';
    case PlayerPosition.RightMidfielder:
      return 'RM';
    case PlayerPosition.RightCenterMidfielder:
      return 'RCM';
    case PlayerPosition.CentralCenterMidfielder:
      return 'CCM';
    case PlayerPosition.LeftCenterMidfielder:
      return 'LCM';
    case PlayerPosition.LeftMidfielder:
      return 'LM';
    case PlayerPosition.RightWinger:
      return 'RW';
    case PlayerPosition.RightAttackingMidfielder:
      return 'RAM';
    case PlayerPosition.CentralAttackingMidfielder:
      return 'CAM';
    case PlayerPosition.LeftAttackingMidfielder:
      return 'LAM';
    case PlayerPosition.LeftWinger:
      return 'LW';
    case PlayerPosition.RightStriker:
      return 'RST';
    case PlayerPosition.CentralStriker:
      return 'CST';
    case PlayerPosition.LeftStriker:
      return 'LST';
    default:
      return '-';
  }
}

/**
 * Get the display label for a player role
 * @param role The PlayerRole enum value
 * @returns The abbreviated role label (e.g., 'GK', 'CB', 'AF')
 * 
 * Note: Some abbreviations are used for multiple roles:
 * - 'C' is used for both Cover and Carrilero
 * - 'IF' is used for both InsideForward and InvertedForward
 * - 'T' is used for both Trequartista and TrequartistaForward
 * This matches the original implementation from tactics-detail.ts
 */
export function getPlayerRoleLabel(role?: PlayerRole): string {
  if (role === undefined || role === null) {
    return 'Not Assigned';
  }
  
  switch(role) {
    // Goalkeepers
    case PlayerRole.Goalkeeper:
      return 'GK';
    case PlayerRole.SweeperKeeper:
      return 'SK';

    // Defenders
    case PlayerRole.CenterBack:
      return 'CB';
    case PlayerRole.BallPlayingDefender:
      return 'BPD';
    case PlayerRole.NoNonsenseCenterBack:
      return 'NCB';
    case PlayerRole.Libero:
      return 'LIB';
    case PlayerRole.Stopper:
      return 'S';
    case PlayerRole.Cover:
      return 'C';
    case PlayerRole.FullBack:
      return 'FB';
    case PlayerRole.WingBack:
      return 'WB';
    case PlayerRole.CompleteWingBack:
      return 'CWB';
    case PlayerRole.InvertedWingBack:
      return 'IWB';
    case PlayerRole.WideCenterBack:
      return 'WCB';

    // Defensive Midfielders
    case PlayerRole.DefensiveMidfielder:
      return 'DM';
    case PlayerRole.Anchorman:
      return 'A';
    case PlayerRole.HalfBack:
      return 'HB';
    case PlayerRole.DeepLyingPlaymaker:
      return 'DLP';
    case PlayerRole.Regista:
      return 'REG';
    case PlayerRole.Volante:
      return 'VOL';
    case PlayerRole.SegundoVolante:
      return 'SVOL';
    case PlayerRole.BallWinningMidfielder:
      return 'BWM';

    // Central Midfielders
    case PlayerRole.CentralMidfielder:
      return 'CM';
    case PlayerRole.BoxToBoxMidfielder:
      return 'BTBM';
    case PlayerRole.Mezzala:
      return 'MEZ';
    case PlayerRole.Carrilero:
      return 'C';
    case PlayerRole.AdvancedPlaymaker:
      return 'AP';
    case PlayerRole.RoamingPlaymaker:
      return 'RP';

    // Wide Midfielders & Wingers
    case PlayerRole.WideMidfielder:
      return 'WM';
    case PlayerRole.WidePlaymaker:
      return 'WP';
    case PlayerRole.Winger:
      return 'W';
    case PlayerRole.InvertedWinger:
      return 'IW';
    case PlayerRole.InsideForward:
      return 'IF';
    case PlayerRole.InvertedForward:
      return 'IF';
    case PlayerRole.Raumdeuter:
      return 'RAU';
    case PlayerRole.WideTargetMan:
      return 'WTM';
    case PlayerRole.DefensiveWinger:
      return 'DW';

    // Attacking Midfielders
    case PlayerRole.AttackingMidfielder:
      return 'AM';
    case PlayerRole.ShadowStriker:
      return 'SS';
    case PlayerRole.Enganche:
      return 'ENG';
    case PlayerRole.Trequartista:
      return 'T';
    case PlayerRole.SecondStriker:
      return 'SES';
    case PlayerRole.FalseTen:
      return 'F10';
    case PlayerRole.CentralWinger:
      return 'CW';

    // Forwards
    case PlayerRole.AdvancedForward:
      return 'AF';
    case PlayerRole.CompleteForward:
      return 'CF';
    case PlayerRole.Poacher:
      return 'P';
    case PlayerRole.TargetMan:
      return 'TM';
    case PlayerRole.DeepLyingForward:
      return 'DLF';
    case PlayerRole.PressingForward:
      return 'PF';
    case PlayerRole.DefensiveForward:
      return 'DF';
    case PlayerRole.FalseNine:
      return 'F9';
    case PlayerRole.TrequartistaForward:
      return 'T';

    default:
      return '-';
  }
}

  // Position sort order map - defines the tactical field layout order
  export const positionSortOrder: Record<number, number> = {
    [PlayerPosition.Goalkeeper]: 1,
    [PlayerPosition.RightBack]: 2,
    [PlayerPosition.RightCenterBack]: 3,
    [PlayerPosition.CentralCenterBack]: 4,
    [PlayerPosition.LeftCenterBack]: 5,
    [PlayerPosition.LeftBack]: 6,
    [PlayerPosition.RightWingBack]: 7,
    [PlayerPosition.RightDefensiveMidfielder]: 8,
    [PlayerPosition.CentralDefensiveMidfielder]: 9,
    [PlayerPosition.LeftDefensiveMidfielder]: 10,
    [PlayerPosition.LeftWingBack]: 11,
    [PlayerPosition.RightMidfielder]: 12,
    [PlayerPosition.RightCenterMidfielder]: 13,
    [PlayerPosition.CentralCenterMidfielder]: 14,
    [PlayerPosition.LeftCenterMidfielder]: 15,
    [PlayerPosition.LeftMidfielder]: 16,
    [PlayerPosition.RightWinger]: 17,
    [PlayerPosition.RightAttackingMidfielder]: 18,
    [PlayerPosition.CentralAttackingMidfielder]: 19,
    [PlayerPosition.LeftAttackingMidfielder]: 20,
    [PlayerPosition.LeftWinger]: 21,
    [PlayerPosition.RightStriker]: 22,
    [PlayerPosition.CentralStriker]: 23,
    [PlayerPosition.LeftStriker]: 24
  };
