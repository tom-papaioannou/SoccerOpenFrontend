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
    { key: 'playerName', header: 'Player Name', width: '40%', sortable: true },
    { key: 'position', header: 'Position', sortable: true },
    { key: 'role', header: 'Role', sortable: true }
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
      case PlayerRole.Starter:
        return 'Starter';
      case PlayerRole.Substitute:
        return 'Substitute';
      case PlayerRole.Reserve:
        return 'Reserve';
      default:
        return 'None';
    }
  }

  getPlayerPositionLabel(position?: number): string {
    if (position === undefined || position === null) {
      return '-';
    }
    
    switch(position) {
      case PlayerPosition.Goalkeeper:
        return 'Goalkeeper';
      case PlayerPosition.RightBack:
        return 'Right Back';
      case PlayerPosition.LeftBack:
        return 'Left Back';
      case PlayerPosition.CenterBack:
        return 'Center Back';
      case PlayerPosition.DefensiveMidfielder:
        return 'Defensive Midfielder';
      case PlayerPosition.RightWingBack:
        return 'Right Wing Back';
      case PlayerPosition.LeftWingBack:
        return 'Left Wing Back';
      case PlayerPosition.CentralMidfielder:
        return 'Central Midfielder';
      case PlayerPosition.RightMidfielder:
        return 'Right Midfielder';
      case PlayerPosition.LeftMidfielder:
        return 'Left Midfielder';
      case PlayerPosition.AttackingMidfielder:
        return 'Attacking Midfielder';
      case PlayerPosition.RightWinger:
        return 'Right Winger';
      case PlayerPosition.LeftWinger:
        return 'Left Winger';
      case PlayerPosition.Striker:
        return 'Striker';
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
      const playerName = pt.Player?.Person 
        ? `${pt.Player.Person.Name || ''} ${pt.Player.Person.Surname || ''}`.trim() 
        : 'Unknown Player';
      
      return {
        playerName,
        position: this.getPlayerPositionLabel(pt.PlayerPosition),
        role: this.getPlayerRoleLabel(pt.PlayerRole)
      };
    });
  }
}
