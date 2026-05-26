/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnDef, DataTable } from "../../shared/tables/data-table/data-table";
import { TeamsService } from '../../../services/teams.service';
import { Person, PlayerPosition, PlayerRole } from '../../../models/player-enums.model';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { getGroupedPlayerPositionLabel, getPlayerRoleLabel, positionSortOrder } from '../../../utils/position-utils';
import { calculateAge } from '../../../utils/date-utils';
import { MatSelectModule } from '@angular/material/select';
import { NationService } from '../../../services/nation.service';
import { INation } from '../../../models/nation.model';
import { getNationFlagUrl } from '../../../utils/nation-map-utils';
import { Card } from '../../shared/cards/card/card';

interface TransformedPlayer {
  personID: string;
  shirtNumber: number | string;
  shirtNumberValue?: number | null;
  name: string;
  nationalityFlagUrl: string;
  nationalityName: string;
  position: string;
  positionValue?: PlayerPosition;
  role: string;
  roleValue?: PlayerRole;
  ppr: number | string;
  age: number | string;
  wage: number | string;
  wageValue?: number | null;
  contract: string;
  contractEndDateValue?: string | null;
}

interface ShirtNumberOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-squad',
  imports: [
    DataTable,
    MatSelectModule,
    Card
  ],
  templateUrl: './squad.html',
  styleUrl: './squad.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class Squad implements OnInit, OnDestroy {
  @ViewChild('shirtNumberTemplate', { static: true }) shirtNumberTemplate!: TemplateRef<{ $implicit: TransformedPlayer; value: number | string }>;
  @ViewChild('nationalityTemplate', { static: true }) nationalityTemplate!: TemplateRef<{ $implicit: TransformedPlayer; value: string }>;

  // Custom comparator for position sorting
  private positionComparator = (a: unknown, b: unknown): number => {
    const aOrder = positionSortOrder[a as number] ?? 999;
    const bOrder = positionSortOrder[b as number] ?? 999;
    return aOrder - bOrder;
  };

  displayedColumns: ColumnDef<TransformedPlayer>[] = [];
  shirtNumberOptions: ShirtNumberOption[] = [];
  people: TransformedPlayer[] = [];
  teamName = '';
  leagueID: string | null = null;
  leagueName = '';
  private nationsByID = new Map<string, INation>();
  private currentTeamID: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private readonly teamsService: TeamsService,
    private readonly nationService: NationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {}

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
    { key: 'name', header: 'Name', width: '20%', sortable: true },
    {
      key: 'nationalityFlagUrl',
      header: 'Nationality',
      width: '12%',
      align: 'center',
      headerClass: 'text-center',
      cellClass: 'text-center',
      sortable: true,
      sortAccessor: (row: TransformedPlayer) => row.nationalityName,
      cellTemplate: this.nationalityTemplate
    },
    { 
      key: 'position', 
      header: 'Position',
      width: '12%',
      sortable: true,
      sortAccessor: (row: TransformedPlayer) => row.positionValue,
      comparator: this.positionComparator
    },
    {
      key: 'role',
      header: 'Role',
      width: '11%',
      sortable: true,
      sortAccessor: (row: TransformedPlayer) => row.roleValue
    },
    {
      key: 'ppr',
      header: 'PPR',
      width: '8%',
      align: 'center',
      headerClass: 'text-center',
      cellClass: 'text-center',
      sortable: true
    },
    { key: 'age', header: 'Age', width: '7%', align: 'right', headerClass:'text-end', cellClass:'text-end' },
    {
      key: 'wage',
      header: 'Wage',
      width: '12%',
      align: 'right',
      headerClass: 'text-end',
      cellClass: 'text-end',
      sortable: true,
      sortAccessor: (row: TransformedPlayer) => row.wageValue
    },
    {
      key: 'contract',
      header: 'Contract',
      width: '13%',
      align: 'right',
      headerClass: 'text-end',
      cellClass: 'text-end',
      sortable: true,
      sortAccessor: (row: TransformedPlayer) => row.contractEndDateValue
    }
  ];

    // Subscribe to currentTeamObservable to wait for team to be set
    this.teamsService.currentTeamObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (team) => {
          if (team?.teamID) {
            this.currentTeamID = team.teamID;
            this.teamName = team.name;
            this.leagueID = team.leagueID ?? null;
            this.leagueName = team.leagueName ?? '';
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
    forkJoin({
      players: this.teamsService.getTeamSquad(teamID),
      nations: this.nationService.getAll()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ players, nations }) => {
          this.nationsByID = new Map(nations.map(nation => [nation.nationID, nation]));
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
      const nation = person.nationID ? this.nationsByID.get(person.nationID) : undefined;
      
      // Get the player's best position (highest adaptation)
      const bestPosition = this.getBestPlayerPosition(person);
      const bestRole = this.getBestPlayerRole(person, bestPosition);
      const ppr = this.getPlayerPpr(person, bestPosition, bestRole);
      
      return {
        personID: person.personID,
        shirtNumber: person.shirtNumber ?? '-',
        shirtNumberValue: person.shirtNumber,
        name,
        nationalityFlagUrl: nation ? getNationFlagUrl(nation) : '',
        nationalityName: nation?.name ?? '',
        position: getGroupedPlayerPositionLabel(bestPosition),
        positionValue: bestPosition, // Include raw enum value for sorting
        role: getPlayerRoleLabel(bestRole),
        roleValue: bestRole,
        ppr: ppr !== null ? ppr : '-',
        age: age !== null ? age : '-',
        wage: person.wage !== undefined ? `${person.wage} € / week` : '-',
        wageValue: person.wage ?? null,
        contract: this.formatContractEndDate(person.endDate),
        contractEndDateValue: person.endDate ?? null
      };
    });
  }

  private formatContractEndDate(endDate: string | null | undefined): string {
    if (!endDate) {
      return '-';
    }

    const date = new Date(endDate);
    if (isNaN(date.getTime())) {
      return '-';
    }

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');

    return `${day}/${month}/${date.getUTCFullYear()}`;
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

  private getBestPlayerRole(person: Person, position: PlayerPosition | undefined): PlayerRole | undefined {
    if (position === undefined) {
      return undefined;
    }

    if (!person.playerTrainedRoles || person.playerTrainedRoles.length === 0) {
      return undefined;
    }

    const matchingRoles = person.playerTrainedRoles.filter(role => role.playerPosition === position);

    if (!matchingRoles.length) {
      return undefined;
    }

    const sorted = matchingRoles.sort(
      (a, b) => b.playerTrainedRoleAdaptation - a.playerTrainedRoleAdaptation
    );

    return sorted[0].playerRole;
  }

  private getPlayerPpr(person: Person, position: PlayerPosition | undefined, role: PlayerRole | undefined): number | null {
    if (position === undefined || role === undefined) {
      return null;
    }

    const positionAdaptation = person.playerTrainedPositions
      ?.find(trainedPosition => trainedPosition.playerPosition === position)
      ?.playerTrainedPositionAdaptation;

    const roleAdaptation = person.playerTrainedRoles
      ?.find(trainedRole => trainedRole.playerPosition === position && trainedRole.playerRole === role)
      ?.playerTrainedRoleAdaptation
      ?? person.playerTrainedRoles
        ?.find(trainedRole => trainedRole.playerPosition === undefined && trainedRole.playerRole === role)
        ?.playerTrainedRoleAdaptation;

    if (positionAdaptation === undefined || roleAdaptation === undefined) {
      return null;
    }

    return Math.floor((positionAdaptation + roleAdaptation) / 2);
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
    this.router.navigate(['/player', person.personID]);
  }

  openCompetition(): void {
    if (this.leagueID) {
      this.router.navigate(['/competition', this.leagueID]);
    }
  }
}
