import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { TacticsService } from '../../../services/tactics.service';
import { Tactic, Formation, PlayerTactic } from '../../../models/tactic.model';
import { DataTable } from '../../shared/tables/data-table/data-table';

// Enums for PlayerPosition and PlayerRole (matching backend)
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

export enum PlayerRole {
  None = 0,
  Starter = 1,
  Substitute = 2,
  Reserve = 3
}

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  
  // TODO: Get team ID from route params or auth service
  private teamId = 'dc31837f-b9bc-4ae3-a65f-883fff1a4498';
  
  // State signals
  tactic = signal<Tactic | null>(null);
  playerTactics = signal<PlayerTactic[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Table columns for player tactics
  displayedColumns = [
    { key: 'playerID', header: 'Player ID', width: '40%', sortable: true },
    { key: 'position', header: 'Position', sortable: true },
    { key: 'role', header: 'Role', sortable: true }
  ];

  constructor(
    private readonly tacticsService: TacticsService,
    private readonly cdr: ChangeDetectorRef
  ) {}

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
      tactics: this.tacticsService.getTeamTactics(this.teamId),
      playerTactics: this.tacticsService.getPlayerTactics(tacticId)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ tactics, playerTactics }) => {
          // Find the specific tactic
          const currentTactic = tactics.find(t => t.tacticID === tacticId);
          if (!currentTactic) {
            this.error.set('Tactic not found');
            this.loading.set(false);
            this.cdr.markForCheck();
            return;
          }
          
          this.tactic.set(currentTactic);
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
      case PlayerPosition.GK:
        return 'GK';
      case PlayerPosition.CD:
        return 'CD';
      case PlayerPosition.DL:
        return 'DL';
      case PlayerPosition.DR:
        return 'DR';
      case PlayerPosition.DM:
        return 'DM';
      case PlayerPosition.MC:
        return 'MC';
      case PlayerPosition.ML:
        return 'ML';
      case PlayerPosition.MR:
        return 'MR';
      case PlayerPosition.CF:
        return 'CF';
      default:
        return '-';
    }
  }

  goBack(): void {
    this.router.navigate(['/team/tactics']);
  }

  // Transform playerTactics for table display
  get tableData() {
    return this.playerTactics().map(pt => ({
      playerID: pt.PlayerID || 'Unknown',
      position: this.getPlayerPositionLabel(pt.PlayerPosition),
      role: this.getPlayerRoleLabel(pt.PlayerRole)
    }));
  }
}
