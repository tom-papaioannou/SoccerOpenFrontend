/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { DataTable } from "../../shared/tables/data-table/data-table";
import { TeamsService } from '../../../services/teams.service';
import { Person, PlayerPosition } from '../../../models/player-enums.model';
import { Subject, takeUntil } from 'rxjs';
import { getPlayerPositionLabel, positionSortOrder } from '../../../utils/position-utils';
import { calculateAge } from '../../../utils/date-utils';

interface TransformedPlayer {
  personID: string;
  shirtNumber: number | string;
  shirtNumberValue?: number | null;
  name: string;
  position: string;
  positionValue?: PlayerPosition;
  age: number | string;
}

@Component({
  selector: 'app-squad',
  imports: [
    DataTable
  ],
  templateUrl: './squad.html',
  styleUrl: './squad.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Squad implements OnInit, OnDestroy {

  // Custom comparator for position sorting
  private positionComparator = (a: unknown, b: unknown): number => {
    const aOrder = positionSortOrder[a as number] ?? 999;
    const bOrder = positionSortOrder[b as number] ?? 999;
    return aOrder - bOrder;
  };

  displayedColumns = [
    {
      key: 'shirtNumber',
      header: 'Shirt',
      width: '10%',
      align: 'end',
      headerClass: 'text-end',
      cellClass: 'text-end',
      sortable: true,
      sortAccessor: (row: TransformedPlayer) => row.shirtNumberValue
    },
    { key: 'name', header: 'Name', width: '50%', sortable: true },
    { 
      key: 'position', 
      header: 'Position',
      sortable: true,
      sortAccessor: (row: TransformedPlayer) => row.positionValue,
      comparator: this.positionComparator
    },
    { key: 'age', header: 'Age', align: 'end', headerClass:'text-end', cellClass:'text-end' }
  ];
  people: TransformedPlayer[] = [];
  private destroy$ = new Subject<void>();

  constructor(private readonly teamsService: TeamsService, private readonly cdr: ChangeDetectorRef, private readonly router: Router) {}

  ngOnInit(): void {
    // Subscribe to currentTeamObservable to wait for team to be set
    this.teamsService.currentTeamObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (team) => {
          if (team?.teamID) {
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
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching players:', error);
          // Keep empty array on error
          this.people = [];
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

  onPlayerClick(person: TransformedPlayer): void {
    this.router.navigate(['/team/player', person.personID]);
  }
}
