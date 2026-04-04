/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { CdkDrag, CdkDragStart, CdkDragMove, CdkDragEnd } from '@angular/cdk/drag-drop';
import { TacticsService } from '../../../services/tactics.service';
import { Tactic, Formation, PlayerTactic } from '../../../models/tactic.model';
import { DataTable } from '../../shared/tables/data-table/data-table';
import { getPlayerPositionLabel, getPlayerRoleLabel, positionSortOrder, getPositionPitchRow } from '../../../utils/position-utils';

export interface PitchRowPlayer {
  position: number;
  positionLabel: string;
  playerName: string;
  displayNumber: number;
}

export interface PitchRow {
  rowIndex: number;
  players: PitchRowPlayer[];
  isGoalkeeper: boolean;
}

@Component({
  selector: 'app-tactics-detail',
  imports: [
    CommonModule,
    MatCard,
    MatCardContent,
    MatButtonModule,
    MatIconModule,
    DataTable,
    CdkDrag
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

  /** Tracks the position of the currently dragged player (null when not dragging) */
  draggedPosition = signal<number | null>(null);

  /** Reference to the DOM element currently being hovered during drag */
  private hoveredElement: HTMLElement | null = null;

  /**
   * Computed signal that groups playerTactics into pitch rows for the visual layout.
   * Each row contains players sorted left-to-right (descending enum value).
   * Rows are sorted top-to-bottom (highest row index first: strikers → GK).
   */
  pitchRows = computed<PitchRow[]>(() => {
    const tactics = this.playerTactics();
    if (!tactics.length) return [];

    const rowMap = new Map<number, PitchRowPlayer[]>();

    for (const pt of tactics) {
      const row = getPositionPitchRow(pt.playerPosition);
      if (row < 0) continue;

      const playerName = pt.person
        ? `${pt.person.name?.substring(0, 1) || ''}. ${pt.person.surname || ''}`.trim() || 'Unknown Player'
        : 'Unknown Player';

      const player: PitchRowPlayer = {
        position: pt.playerPosition,
        positionLabel: getPlayerPositionLabel(pt.playerPosition),
        playerName,
        displayNumber: positionSortOrder[pt.playerPosition] ?? 0
      };

      if (!rowMap.has(row)) {
        rowMap.set(row, []);
      }
      rowMap.get(row)!.push(player);
    }

    // Sort players within each row: descending position enum value = left to right
    const rows: PitchRow[] = [];
    for (const [rowIndex, players] of rowMap) {
      players.sort((a, b) => b.position - a.position);
      rows.push({
        rowIndex,
        players,
        isGoalkeeper: rowIndex === 0
      });
    }

    // Sort rows: highest row index first (strikers at top, GK at bottom)
    rows.sort((a, b) => b.rowIndex - a.rowIndex);

    return rows;
  });

  // Custom comparator for position sorting
  private positionComparator = (a: unknown, b: unknown): number => {
    const aOrder = positionSortOrder[a as number] ?? 999;
    const bOrder = positionSortOrder[b as number] ?? 999;
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

  /**
   * Returns the CSS layout classes for a given pitch row.
   */
  getRowClasses(row: PitchRow): string {
    if (row.isGoalkeeper) {
      return 'justify-center h-1/8';
    }
    return row.players.length <= 2 ? 'justify-center gap-10' : 'justify-around';
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

  /** Called when a player node drag begins. Shows a black dot at the original position. */
  onDragStarted(_event: CdkDragStart, player: PitchRowPlayer): void {
    this.draggedPosition.set(player.position);
  }

  /** Called on every pointer move during drag. Detects hover over other player nodes. */
  onDragMoved(event: CdkDragMove): void {
    const { x, y } = event.pointerPosition;
    const dragElement = event.source.element.nativeElement;

    // Clear previous hover target
    if (this.hoveredElement) {
      this.hoveredElement.classList.remove('drag-hover-target');
      this.hoveredElement = null;
    }

    // Check all player nodes for pointer overlap
    const allPlayerNodes = document.querySelectorAll('.player-node');
    for (const node of Array.from(allPlayerNodes)) {
      if (node === dragElement) continue;
      const rect = node.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        (node as HTMLElement).classList.add('drag-hover-target');
        this.hoveredElement = node as HTMLElement;
        break;
      }
    }
  }

  /** Called when drag ends. Swaps players if hovering another, otherwise resets position. */
  onDragEnded(event: CdkDragEnd, player: PitchRowPlayer): void {
    if (this.hoveredElement) {
      const targetPosition = Number(this.hoveredElement.getAttribute('data-position'));
      const targetPlayer = this.findPlayerByPosition(targetPosition);

      this.hoveredElement.classList.remove('drag-hover-target');

      if (targetPlayer) {
        this.onPlayerSwap(player, targetPlayer);
      }
    }

    // Always reset position and clean up
    event.source.reset();
    this.draggedPosition.set(null);
    this.hoveredElement = null;
  }

  /** Called when a dragged player is dropped onto another player. */
  onPlayerSwap(draggedPlayer: PitchRowPlayer, targetPlayer: PitchRowPlayer): void {
    console.log('Player swap:', draggedPlayer.playerName, '→', targetPlayer.playerName);
  }

  /** Finds a PitchRowPlayer by their position enum value. */
  private findPlayerByPosition(position: number): PitchRowPlayer | null {
    for (const row of this.pitchRows()) {
      const player = row.players.find(p => p.position === position);
      if (player) return player;
    }
    return null;
  }
}
