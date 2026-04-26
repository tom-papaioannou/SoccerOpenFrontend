/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, OnDestroy, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { CdkDrag, CdkDragStart, CdkDragMove, CdkDragEnd, CdkDragDrop, CdkDropList, CdkDragHandle, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { TacticsService } from '../../../services/tactics.service';
import { Tactic, Formation, PlayerTactic, SquadUnit } from '../../../models/tactic.model';
import { PlayerRole } from '../../../models/player-enums.model';
import { getPlayerPositionLabel, getPlayerRoleLabel, positionSortOrder, getPositionPitchRow } from '../../../utils/position-utils';
import { FormsModule } from '@angular/forms';

function getSquadUnitLabel(squadUnit: SquadUnit): string {
  switch (squadUnit) {
    case SquadUnit.Starting: return 'Starting';
    case SquadUnit.Substitute: return 'Substitutes';
    case SquadUnit.Reserve: return 'Reserves';
    default: return '-';
  }
}

function getPlayerRoleOptionLabel(role: PlayerRole): string {
  if (role === PlayerRole.None) {
    return 'None';
  }

  const abbreviation = getPlayerRoleLabel(role);

  return `${abbreviation}`;
}

const PLAYER_ROLE_OPTIONS = Object.values(PlayerRole)
  .filter((value): value is PlayerRole => typeof value === 'number')
  .sort((a, b) => a - b)
  .map(value => ({ value, label: getPlayerRoleOptionLabel(value) }));

export interface PitchRowPlayer {
  position: number;
  positionLabel: string;
  playerName: string;
  displayNumber: number;
  playerTacticID?: string;
  role: PlayerRole;
}

export interface PitchRow {
  rowIndex: number;
  players: PitchRowPlayer[];
  isGoalkeeper: boolean;
}

/** Shape of each row displayed in the player tactics drop-list. */
export interface PlayerTacticTableRow {
  playerName: string;
  position: string;
  positionValue: number;
  role: string;
  roleValue: PlayerRole;
  playerTacticID: string | undefined;
  squadUnit: SquadUnit;
  squadUnitLabel: string;
  substituteOrder: number;
}

@Component({
  selector: 'app-tactics-detail',
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    CdkDrag,
    CdkDropList,
    CdkDragHandle,
    CdkDragPlaceholder,
    FormsModule
  ],
  templateUrl: './tactics-detail.html',
  styleUrl: './tactics-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TacticsDetail implements OnInit, OnDestroy {
  readonly SquadUnit = SquadUnit;
  readonly playerRoleOptions = PLAYER_ROLE_OPTIONS;

  private readonly destroyRef: DestroyRef;
  private readonly route: ActivatedRoute;
  private readonly router: Router;
  
  // State signals
  tactic = signal<Tactic | null>(null);
  playerTactics = signal<PlayerTactic[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  tacticId = signal<string | null>(null);

  /** Tracks the position of the currently dragged player (null when not dragging) */
  draggedPosition = signal<number | null>(null);

  /** Reference to the DOM element currently being hovered during drag */
  private hoveredElement: HTMLElement | null = null;

  /** Currently selected squad unit filter (0 = Starting, 1 = Substitutes, 2 = Reserves) */
  selectedSquadUnit = signal<SquadUnit>(SquadUnit.Starting);

  /** Player tactic ids with a role update in flight. */
  private updatingRoleIds = signal<Set<string>>(new Set());

  /** Timer handle for the debounced hover removal (1 s after pointer leaves a target) */
  private hoverRemovalTimer: ReturnType<typeof setTimeout> | null = null;

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
      // Only show starting players (squadUnit 0) on the pitch
      if (pt.squadUnit !== SquadUnit.Starting) continue;
      const row = getPositionPitchRow(pt.playerPosition);
      if (row < 0) continue;

      const playerName = pt.person
        ? `${pt.person.name?.substring(0, 1) || ''}. ${pt.person.surname || ''}`.trim() || 'Unknown Player'
        : 'Unknown Player';

      const player: PitchRowPlayer = {
        position: pt.playerPosition,
        positionLabel: getPlayerPositionLabel(pt.playerPosition),
        playerName,
        displayNumber: positionSortOrder[pt.playerPosition] ?? 0,
        playerTacticID: pt.playerTacticID,
        role: pt.playerRole
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

  constructor(
    private readonly tacticsService: TacticsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly elementRef: ElementRef,
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
    
    this.tacticId.set(tacticId);
    this.loadTacticDetails(tacticId);
  }

  ngOnDestroy(): void {
    this.clearHoverTimer();
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

  // Transform playerTactics for table display, grouped by squad unit:
  // Starting players (0) sorted by position, Substitutes (1) sorted by substituteOrder, Reserves (2) in default order
  get tableData(): PlayerTacticTableRow[] {
    const all: PlayerTacticTableRow[] = this.playerTactics().map(pt => {
      const playerName = pt.person ? `${pt.person.name?.substring(0, 1) || ''}. ${pt.person.surname || ''}`.trim() || 'Unknown Player'
        : 'Unknown Player';
      return {
        playerName,
        position: pt.squadUnit === SquadUnit.Starting ? getPlayerPositionLabel(pt.playerPosition) : (pt.squadUnit === SquadUnit.Substitute ? `S${pt.substituteOrder ?? ''}` : 'Res'),
        positionValue: pt.playerPosition, // Include raw enum value for sorting
        role: getPlayerRoleLabel(pt.playerRole),
        roleValue: pt.playerRole,
        playerTacticID: pt.playerTacticID,
        squadUnit: pt.squadUnit,
        squadUnitLabel: getSquadUnitLabel(pt.squadUnit),
        substituteOrder: pt.substituteOrder ?? Number.MAX_SAFE_INTEGER
      };
    });

    const starting = all
      .filter(p => p.squadUnit === SquadUnit.Starting)
      .sort((a, b) => (positionSortOrder[a.positionValue] ?? 999) - (positionSortOrder[b.positionValue] ?? 999));
    const substitutes = all
      .filter(p => p.squadUnit === SquadUnit.Substitute)
      .sort((a, b) => a.substituteOrder - b.substituteOrder);
    const reserves = all.filter(p => p.squadUnit === SquadUnit.Reserve);

    return [...starting, ...substitutes, ...reserves];
  }

  /** Returns table data filtered by the currently selected squad unit. */
  get filteredTableData(): PlayerTacticTableRow[] {
    return this.tableData.filter(p => p.squadUnit === this.selectedSquadUnit());
  }

  isRoleUpdating(playerTacticID: string | undefined): boolean {
    return !!playerTacticID && this.updatingRoleIds().has(playerTacticID);
  }

  onPlayerRoleChange(player: PlayerTacticTableRow, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const nextRole = Number(select.value) as PlayerRole;
    const previousRole = player.roleValue;
    const teamID = this.tactic()?.teamID;

    if (!player.playerTacticID || !teamID) {
      select.value = String(previousRole);
      this.error.set('Cannot update player role: missing tactic or team information.');
      this.cdr.markForCheck();
      return;
    }

    if (player.squadUnit !== SquadUnit.Starting) {
      select.value = String(previousRole);
      this.error.set('Only starting squad player roles can be updated.');
      this.cdr.markForCheck();
      return;
    }

    if (nextRole === previousRole) {
      return;
    }

    this.error.set(null);
    this.setRoleUpdateInProgress(player.playerTacticID, true);
    this.updatePlayerRoleInState(player.playerTacticID, nextRole);

    this.tacticsService.updateStartingPlayerRole(teamID, player.playerTacticID, nextRole)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedPlayerTactic) => {
          this.replacePlayerTacticInState(updatedPlayerTactic);
          this.setRoleUpdateInProgress(player.playerTacticID!, false);
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.updatePlayerRoleInState(player.playerTacticID!, previousRole);
          this.setRoleUpdateInProgress(player.playerTacticID!, false);
          this.error.set(err.message || 'Failed to update player role');
          this.cdr.markForCheck();
        }
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

    // Find the player node (if any) under the current pointer position
    let foundTarget: HTMLElement | null = null;
    const allPlayerNodes = this.elementRef.nativeElement.querySelectorAll('.player-node');
    for (const node of Array.from(allPlayerNodes)) {
      if (node === dragElement) continue;
      const rect = (node as HTMLElement).getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        foundTarget = node as HTMLElement;
        break;
      }
    }

    if (foundTarget) {
      if (foundTarget === this.hoveredElement) {
        // Still hovering the same target – cancel any pending removal
        this.clearHoverTimer();
      } else {
        // Hovering a *different* target – immediately swap
        this.clearHoverState();
        foundTarget.classList.add('drag-hover-target');
        this.hoveredElement = foundTarget;
      }
    } else if (this.hoveredElement && !this.hoverRemovalTimer) {
      // Pointer left the current target – start a 1 s debounce before removing hover
      this.hoverRemovalTimer = setTimeout(() => {
        this.clearHoverState();
      }, 1000);
    }
  }

  /** Removes the hover visual from the current target and cancels any pending timer. */
  private clearHoverState(): void {
    this.clearHoverTimer();
    if (this.hoveredElement) {
      this.hoveredElement.classList.remove('drag-hover-target');
      this.hoveredElement = null;
    }
  }

  /** Cancels the debounced hover-removal timer if one is running. */
  private clearHoverTimer(): void {
    if (this.hoverRemovalTimer) {
      clearTimeout(this.hoverRemovalTimer);
      this.hoverRemovalTimer = null;
    }
  }

  /** Called when drag ends. Swaps players if hovering another, otherwise resets position. */
  onDragEnded(event: CdkDragEnd, player: PitchRowPlayer): void {
    if (this.hoveredElement) {
      const positionAttr = this.hoveredElement.getAttribute('data-position');

      if (positionAttr != null) {
        const targetPlayer = this.findPlayerByPosition(Number(positionAttr));
        if (targetPlayer) {
          this.onPlayerSwap(player, targetPlayer);
        }
      }
    }

    // Always reset position and clean up
    event.source.reset();
    this.draggedPosition.set(null);
    this.clearHoverState();
  }

  /** Called when a dragged player is dropped onto another player. */
  onPlayerSwap(draggedPlayer: PitchRowPlayer, targetPlayer: PitchRowPlayer): void {
    this.tacticsService.swapPlayerTactics(draggedPlayer.playerTacticID!, targetPlayer.playerTacticID!).subscribe({
      next: () => this.reloadPlayerTactics(),
      error: (err) => {
        console.error('Error swapping players:', err);
      }
    });
  }

  /** Handles a drop event on the player tactics list. */
  onTablePlayerDrop(event: CdkDragDrop<PlayerTacticTableRow[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    const data = this.filteredTableData;
    const draggedPlayer = data[event.previousIndex];
    const targetPlayer = data[event.currentIndex];

    if (!draggedPlayer?.playerTacticID || !targetPlayer?.playerTacticID) return;

    this.tacticsService.swapPlayerTactics(draggedPlayer.playerTacticID, targetPlayer.playerTacticID).subscribe({
      next: () => this.reloadPlayerTactics(),
      error: (err) => {
        console.error('Error swapping players in list:', err);
      }
    });
  }

  /** Reloads the player tactics from the backend and updates the signal.
   *  Note: takeUntilDestroyed is safe here because this.destroyRef was captured
   *  in the constructor (injection context) and is passed explicitly. */
  private reloadPlayerTactics(): void {
    const id = this.tacticId();
    if (!id) return;
    this.tacticsService.getPlayerTactics(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pts) => {
          this.playerTactics.set(pts);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error reloading player tactics:', err);
        }
      });
  }

  private setRoleUpdateInProgress(playerTacticID: string, isUpdating: boolean): void {
    this.updatingRoleIds.update(ids => {
      const nextIds = new Set(ids);

      if (isUpdating) {
        nextIds.add(playerTacticID);
      } else {
        nextIds.delete(playerTacticID);
      }

      return nextIds;
    });
  }

  private updatePlayerRoleInState(playerTacticID: string, playerRole: PlayerRole): void {
    this.playerTactics.update(playerTactics =>
      playerTactics.map(playerTactic =>
        playerTactic.playerTacticID === playerTacticID
          ? { ...playerTactic, playerRole }
          : playerTactic
      )
    );
  }

  private replacePlayerTacticInState(updatedPlayerTactic: PlayerTactic): void {
    this.playerTactics.update(playerTactics =>
      playerTactics.map(playerTactic =>
        playerTactic.playerTacticID === updatedPlayerTactic.playerTacticID
          ? { ...playerTactic, ...updatedPlayerTactic, person: updatedPlayerTactic.person ?? playerTactic.person }
          : playerTactic
      )
    );
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
