/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

import { TeamsService } from '../../../services/teams.service';
import { Card } from '../../shared/cards/card/card';
import { DataTable } from '../../shared/tables/data-table/data-table';
import { getPlayerPositionLabel, getPlayerRoleLabel } from '../../../utils/position-utils';
import { calculateAge } from '../../../utils/date-utils';
import { PlayerStats } from '../../../models/player-enums.model';

interface PlayerDetailsResponse {
  name: string;
  surname: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  playerStats: PlayerStats | null;
  playerTrainedPositions: Array<{
    playerPosition: number;
    playerTrainedPositionAdaptation: number;
  }>;
  playerTrainedRoles: Array<{
    playerRole: number;
    playerTrainedRoleAdaptation: number;
  }>;
  contracts: Array<{
    startDate: string;
    endDate: string;
    team: {
      name: string;
    };
  }>;
}

interface TransformedPosition {
  position: string;
  adaptation: number;
}

interface TransformedRole {
  role: string;
  adaptation: number;
}

interface TransformedContract {
  team: string;
  period: string;
}

interface StatValue {
  name: string;
  value: number;
}

interface TransformedStat {
  category: string;
  stats: StatValue[];
}

@Component({
  selector: 'app-player-details',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    Card,
    DataTable
  ],
  templateUrl: './player-details.html',
  styleUrl: './player-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerDetails implements OnInit, OnDestroy {
  playerDetails: PlayerDetailsResponse | null = null;
  currentPlayerTeam = '-';
  playerName = '';
  dateOfBirth = '';
  age: number | null = null;
  placeOfBirth = '';
  loading = true;
  error: string | null = null;

  positionsColumns = [
    { key: 'position', header: 'Position', width: '60%' },
    { key: 'adaptation', header: 'Adaptation', align: 'end', headerClass: 'text-end', cellClass: 'text-end' }
  ];

  rolesColumns = [
    { key: 'role', header: 'Role', width: '60%' },
    { key: 'adaptation', header: 'Adaptation', align: 'end', headerClass: 'text-end', cellClass: 'text-end' }
  ];

  contractsColumns = [
    { key: 'team', header: 'Team', width: '60%' },
    { key: 'period', header: 'Period', width: '40%' }
  ];

  transformedPositions: TransformedPosition[] = [];
  transformedRoles: TransformedRole[] = [];
  transformedContracts: TransformedContract[] = [];
  transformedStats: TransformedStat[] = [];
  hoveredStatKey: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly teamsService: TeamsService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const playerId = this.route.snapshot.paramMap.get('id');
    if (playerId) {
      this.loadPlayerDetails(playerId);
    } else {
      this.error = 'No player ID provided';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPlayerDetails(playerId: string): void {
    this.loading = true;
    this.teamsService.getPlayerDetails(playerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: PlayerDetailsResponse) => {
          this.playerDetails = data;
          this.playerName = `${data.name || ''} ${data.surname || ''}`.trim();
          this.dateOfBirth = this.formatDateOfBirth(data.dateOfBirth);
          this.age = calculateAge(data.dateOfBirth);
          this.placeOfBirth = data.placeOfBirth || '';
          this.transformPositions();
          this.transformRoles();
          this.transformContracts();
          this.transformStats();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading player details:', error);
          this.error = 'Failed to load player details';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private transformPositions(): void {
    if (this.playerDetails?.playerTrainedPositions) {
      this.transformedPositions = this.playerDetails.playerTrainedPositions
        .map(p => ({
          position: getPlayerPositionLabel(p.playerPosition) || 'Unknown',
          adaptation: p.playerTrainedPositionAdaptation
        }))
        .sort((a, b) => b.adaptation - a.adaptation);
    }
  }

  private transformRoles(): void {
    if (this.playerDetails?.playerTrainedRoles) {
      this.transformedRoles = this.playerDetails.playerTrainedRoles
        .map(r => ({
          role: getPlayerRoleLabel(r.playerRole) || 'Unknown',
          adaptation: r.playerTrainedRoleAdaptation
        }))
        .sort((a, b) => b.adaptation - a.adaptation);
    }
  }

  private transformContracts(): void {
    if (this.playerDetails?.contracts) {
      if(new Date(this.playerDetails.contracts[0].endDate) > new Date()){
        this.currentPlayerTeam = this.playerDetails.contracts[0].team?.name;
      }
      this.transformedContracts = this.playerDetails.contracts
        .map(c => ({
          team: c.team?.name || 'Unknown',
          period: this.formatContractPeriod(c.startDate, c.endDate)
        }));
    }
  }

  private transformStats(): void {
    if (this.playerDetails?.playerStats) {
      const stats = this.playerDetails.playerStats;
      
      this.transformedStats = [
        {
          category: 'Technical',
          stats: [
            { name: 'Shooting', value: stats.shooting },
            { name: 'Passing', value: stats.passing },
            { name: 'Crossing', value: stats.crossing },
            { name: 'Dribbling', value: stats.dribbling },
            { name: 'Control', value: stats.control },
            { name: 'Kicking', value: stats.kicking },
            { name: 'Tackling', value: stats.tackling },
            { name: 'Goalkeeping', value: stats.goalkeeping }
          ]
        },
        {
          category: 'Physical',
          stats: [
            { name: 'Speed', value: stats.speed },
            { name: 'Acceleration', value: stats.acceleration },
            { name: 'Strength', value: stats.strength },
            { name: 'Jumping', value: stats.jumping },
            { name: 'Stamina', value: stats.stamina }
          ]
        },
        {
          category: 'Mental',
          stats: [
            { name: 'Teamwork', value: stats.teamwork },
            { name: 'Creativity', value: stats.creativity },
            { name: 'Decisions', value: stats.decisions },
            { name: 'Positioning', value: stats.positioning }
          ]
        }
      ];
    } else {
      this.transformedStats = [];
    }
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString();
  }

  private formatDateOfBirth(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    
    return `${day}/${month}/${year}`;
  }

  private formatContractPeriod(startDateString: string, endDateString: string): string {
    if (!startDateString || !endDateString) return '-';
    
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    const now = new Date();
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '-';
    
    const startYear = startDate.getUTCFullYear();
    const endYear = endDate.getUTCFullYear();
    
    // Compare using UTC date-only (without time) to avoid time-of-day issues
    const endDateOnly = new Date(Date.UTC(endYear, endDate.getUTCMonth(), endDate.getUTCDate()));
    const nowDateOnly = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    // Check if end date is after now (current/active contract)
    if (endDateOnly > nowDateOnly) {
      return `${startYear} -`;
    }
    
    // End date is before or equal to now (past contract)
    if (startYear === endYear) {
      // Same year
      return `${startYear}`;
    } else {
      // Different years
      return `${startYear} - ${endYear}`;
    }
  }

  goBack(): void {
    this.router.navigate(['/team/squad']);
  }

  getStatValueClass(value: number): string {
    if (value <= 50) {
      return 'text-red-400';
    }

    if (value <= 75) {
      return 'text-yellow-400';
    }

    return 'text-green-400';
  }
}
