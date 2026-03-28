/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

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
import { PlayerPosition } from '../../../models/player-enums.model';
import { DataTable } from '../../shared/tables/data-table/data-table';
import { getPlayerPositionLabel, getPlayerRoleLabel } from '../../../utils/position-utils';

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
  
  // Position sort order map - defines the tactical field layout order
  private readonly positionSortOrder: Record<number, number> = {
    [PlayerPosition.Goalkeeper]: 1,
    [PlayerPosition.LeftBack]: 2,
    [PlayerPosition.CenterBack]: 3,
    [PlayerPosition.RightBack]: 4,
    [PlayerPosition.LeftWingBack]: 5,
    [PlayerPosition.DefensiveMidfielder]: 6,
    [PlayerPosition.RightWingBack]: 7,
    [PlayerPosition.LeftMidfielder]: 8,
    [PlayerPosition.CentralMidfielder]: 9,
    [PlayerPosition.RightMidfielder]: 10,
    [PlayerPosition.LeftWinger]: 11,
    [PlayerPosition.AttackingMidfielder]: 12,
    [PlayerPosition.RightWinger]: 13,
    [PlayerPosition.Striker]: 14
  };

  // Custom comparator for position sorting
  private positionComparator = (a: unknown, b: unknown): number => {
    const aOrder = this.positionSortOrder[a as number] ?? 999;
    const bOrder = this.positionSortOrder[b as number] ?? 999;
    return aOrder - bOrder;
  };
  
  // Table columns for player tactics
  displayedColumns = [
    { 
      key: 'position', 
      width: '10%', 
      header: 'Position', 
      sortable: true,
      sortAccessor: (row: any) => row.positionValue,
      comparator: this.positionComparator
    },
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

  goBack(): void {
    this.router.navigate(['/team/tactics']);
  }

  // Transform playerTactics for table display
  get tableData() {
    return this.playerTactics().map(pt => {
      const playerName = pt.person
        ? `${pt.person.name?.substring(0, 1) || ''}. ${pt.person.surname || ''}`.trim() || 'Unknown Player'
        : 'Unknown Player';
      return {
        playerName,
        position: getPlayerPositionLabel(pt.playerPosition),
        positionValue: pt.playerPosition, // Include raw enum value for sorting
        role: getPlayerRoleLabel(pt.playerRole)
      };
    });
  }

  playerNameInTactics(position: string): string {
    return this.tableData.find(p => p.position === position)?.playerName || position;
  }
}
