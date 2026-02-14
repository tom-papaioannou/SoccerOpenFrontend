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
    case PlayerPosition.LeftBack:
      return 'LB';
    case PlayerPosition.CenterBack:
      return 'CB';
    case PlayerPosition.DefensiveMidfielder:
      return 'DM';
    case PlayerPosition.RightWingBack:
      return 'RWB';
    case PlayerPosition.LeftWingBack:
      return 'LWB';
    case PlayerPosition.CentralMidfielder:
      return 'CM';
    case PlayerPosition.RightMidfielder:
      return 'RM';
    case PlayerPosition.LeftMidfielder:
      return 'LM';
    case PlayerPosition.AttackingMidfielder:
      return 'AM';
    case PlayerPosition.RightWinger:
      return 'RW';
    case PlayerPosition.LeftWinger:
      return 'LW';
    case PlayerPosition.Striker:
      return 'ST';
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
