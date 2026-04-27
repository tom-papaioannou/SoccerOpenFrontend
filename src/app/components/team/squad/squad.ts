/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnDef, DataTable } from "../../shared/tables/data-table/data-table";
import { TeamsService } from '../../../services/teams.service';
import { Person, PlayerPosition } from '../../../models/player-enums.model';
import { Subject, takeUntil } from 'rxjs';
import { getPlayerPositionLabel, positionSortOrder } from '../../../utils/position-utils';
import { calculateAge } from '../../../utils/date-utils';
import { MatSelectModule } from '@angular/material/select';

interface TransformedPlayer {
  personID: string;
  shirtNumber: number | string;
  shirtNumberValue?: number | null;
  name: string;
  position: string;
  positionValue?: PlayerPosition;
  age: number | string;
}

interface ShirtNumberOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-squad',
  imports: [
    DataTable,
    MatSelectModule
  ],
  templateUrl: './squad.html',
  styleUrl: './squad.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class Squad implements OnInit, OnDestroy {
  @ViewChild('shirtNumberTemplate', { static: true }) shirtNumberTemplate!: TemplateRef<{ $implicit: TransformedPlayer; value: number | string }>;

  // Custom comparator for position sorting
  private positionComparator = (a: unknown, b: unknown): number => {
    const aOrder = positionSortOrder[a as number] ?? 999;
    const bOrder = positionSortOrder[b as number] ?? 999;
    return aOrder - bOrder;
  };

  displayedColumns: ColumnDef<TransformedPlayer>[] = [];
  shirtNumberOptions: ShirtNumberOption[] = [];
  people: TransformedPlayer[] = [];
  private currentTeamID: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private readonly teamsService: TeamsService, private readonly cdr: ChangeDetectorRef, private readonly router: Router) {}

  ngOnInit(): void {
    this.displayedColumns = [
    {
      key: 'shirtNumber',
      header: 'Shirt',
      width: '5%',
      align: 'right',
      headerClass: 'text-end',
      cellClass: 'text-end',
      sortable: true,
      sortAccessor: (row: TransformedPlayer) => row.shirtNumberValue,
      cellTemplate: this.shirtNumberTemplate
    },
    { key: 'name', header: 'Name', width: '38%', sortable: true },
    { 
      key: 'position', 
      header: 'Position',
      width: '15%',
      sortable: true,
      sortAccessor: (row: TransformedPlayer) => row.positionValue,
      comparator: this.positionComparator
    },
    { key: 'age', header: 'Age', width: '15%', align: 'right', headerClass:'text-end', cellClass:'text-end' }
  ];

    // Subscribe to currentTeamObservable to wait for team to be set
    this.teamsService.currentTeamObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (team) => {
          if (team?.teamID) {
            this.currentTeamID = team.teamID;
            this.loadPlayers(team.teamID);
          }
        },
        error: (error) => {
          console.error('Error getting current team:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPlayers(teamID: string): void {
    this.teamsService.getTeamSquad(teamID)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (players: Person[]) => {
          this.people = this.transformPlayers(players);
          this.shirtNumberOptions = this.buildShirtNumberOptions(this.people);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching players:', error);
          // Keep empty array on error
          this.people = [];
          this.shirtNumberOptions = this.buildShirtNumberOptions(this.people);
        }
      });
  }

  private transformPlayers(people: Person[]): TransformedPlayer[] {
    return people.map(person => {
      let name = 'Unknown';
      if (person.name || person.surname) {
        name = `${person.name || ''} ${person.surname || ''}`.trim();
      }
      const age = person.dateOfBirth ? calculateAge(person.dateOfBirth) : null;
      
      // Get the player's best position (highest adaptation)
      const bestPosition = this.getBestPlayerPosition(person);
      
      return {
        personID: person.personID,
        shirtNumber: person.shirtNumber ?? '-',
        shirtNumberValue: person.shirtNumber,
        name,
        position: getPlayerPositionLabel(bestPosition),
        positionValue: bestPosition, // Include raw enum value for sorting
        age: age !== null ? age : '-'
      };
    });
  }

  private getBestPlayerPosition(person: Person): PlayerPosition | undefined {
    if (!person.playerTrainedPositions || person.playerTrainedPositions.length === 0) {
      return undefined;
    }

    // Sort by adaptation (descending) and get the first one
    const sorted = [...person.playerTrainedPositions].sort(
      (a, b) => b.playerTrainedPositionAdaptation - a.playerTrainedPositionAdaptation
    );
    
    return sorted[0].playerPosition;
  }

  private buildShirtNumberOptions(people: TransformedPlayer[]): ShirtNumberOption[] {
    const assignments = new Map<number, string>();

    for (const person of people) {
      if (!person.shirtNumberValue) {
        continue;
      }

      assignments.set(person.shirtNumberValue, person.name);
    }

    return Array.from({ length: 99 }, (_, index) => {
      const shirtNumber = index + 1;
      const assignedPlayerName = assignments.get(shirtNumber) ?? '';

      return {
        value: shirtNumber,
        label: `${shirtNumber} - ${assignedPlayerName}`
      };
    });
  }

  onShirtNumberDropdownClick(event: Event): void {
    event.stopPropagation();
  }

  onShirtNumberSelectionChange(shirtNumber: number, person: TransformedPlayer): void {
    if (!this.currentTeamID || !shirtNumber || shirtNumber === person.shirtNumberValue) {
      return;
    }

    const previousShirtNumber = person.shirtNumberValue ?? null;

    this.teamsService.updatePlayerShirtNumber(this.currentTeamID, person.personID, shirtNumber)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.people = this.people.map(player => {
            if (player.personID === person.personID) {
              return {
                ...player,
                shirtNumber,
                shirtNumberValue: shirtNumber
              };
            }

            if (player.shirtNumberValue === shirtNumber) {
              return {
                ...player,
                shirtNumber: previousShirtNumber ?? '-',
                shirtNumberValue: previousShirtNumber
              };
            }

            return player;
          });
          this.shirtNumberOptions = this.buildShirtNumberOptions(this.people);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error updating shirt number:', error);
          this.cdr.detectChanges();
        }
      });
  }

  onPlayerClick(person: TransformedPlayer): void {
    this.router.navigate(['/team/player', person.personID]);
  }
}
