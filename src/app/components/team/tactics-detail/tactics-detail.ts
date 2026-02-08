import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { TacticsService } from '../../../services/tactics.service';
import { Tactic, Formation, PlayerTactic } from '../../../models/tactic.model';
import { PlayerPosition, PlayerRole } from '../../../models/player-enums.model';
import { DataTable } from '../../shared/tables/data-table/data-table';

@Component({
  selector: 'app-tactics-detail',
  imports: [
    CommonModule,
    MatCard,
    MatCardContent,
    MatButtonModule,
    MatIconModule,
    DataTable
  ],
  templateUrl: './tactics-detail.html',
  styleUrl: './tactics-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TacticsDetail implements OnInit {
  private readonly destroyRef: DestroyRef;
  private readonly route: ActivatedRoute;
  private readonly router: Router;
  
  // State signals
  tactic = signal<Tactic | null>(null);
  playerTactics = signal<PlayerTactic[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Table columns for player tactics
  displayedColumns = [
    { key: 'position', width: '10%', header: 'Position', sortable: true },
    { key: 'playerName', header: 'Name', width: '80%', sortable: true },
    { key: 'role', width: '10%', header: 'Role', sortable: true }
  ];

  constructor(
    private readonly tacticsService: TacticsService,
    private readonly cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    router: Router,
    destroyRef: DestroyRef
  ) {
    this.route = route;
    this.router = router;
    this.destroyRef = destroyRef;
  }

  ngOnInit(): void {
    const tacticId = this.route.snapshot.paramMap.get('id');
    if (!tacticId) {
      this.error.set('No tactic ID provided');
      return;
    }
    
    this.loadTacticDetails(tacticId);
  }

  loadTacticDetails(tacticId: string): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      tactic: this.tacticsService.getTeamTactic(tacticId),
      playerTactics: this.tacticsService.getPlayerTactics(tacticId)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ tactic, playerTactics }) => {
          if (!tactic) {
            this.error.set('Tactic not found');
            this.loading.set(false);
            this.cdr.markForCheck();
            return;
          }
          
          this.tactic.set(tactic);
          this.playerTactics.set(playerTactics);
          this.loading.set(false);
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load tactic details');
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  getFormationImagePath(formation?: Formation): string {
    switch(formation){
      case Formation.Four_Three_Three:
        return 'assets/images/tactics/4-3-3.png';
      case Formation.Three_Five_Two:
        return 'assets/images/tactics/3-5-2.png';
      case Formation.Five_Three_Two:
        return 'assets/images/tactics/5-3-2.png';
      case Formation.Four_Five_One:
        return 'assets/images/tactics/4-5-1.png';
    }

    // defaults to 4-4-2 image
    return 'assets/images/tactics/4-4-2.png';
  }

  getPlayerRoleLabel(role?: number): string {
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

  getPlayerPositionLabel(position?: number): string {
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

  goBack(): void {
    this.router.navigate(['/team/tactics']);
  }

  // Transform playerTactics for table display
  get tableData() {
    return this.playerTactics().map(pt => {
      const playerName = pt.player?.person
        ? `${pt.player.person.name || ''} ${pt.player.person.surname || ''}`.trim() || 'Unknown Player'
        : 'Unknown Player';
      return {
        playerName,
        position: this.getPlayerPositionLabel(pt.playerPosition),
        role: this.getPlayerRoleLabel(pt.playerRole)
      };
    });
  }
}
