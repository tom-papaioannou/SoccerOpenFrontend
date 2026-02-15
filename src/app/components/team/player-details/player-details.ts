import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

import { TeamsService } from '../../../services/teams.service';
import { DataTable } from '../../shared/tables/data-table/data-table';
import { getPlayerPositionLabel, getPlayerRoleLabel } from '../../../utils/position-utils';
import { PlayerStats } from '../../../models/player-enums.model';

interface PlayerDetailsResponse {
  person: {
    name: string;
    surname: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
    contracts: Array<{
      startDate: string;
      endDate: string;
      team: {
        name: string;
      };
    }>;
  };
  playerStats: PlayerStats | null;
  playerTrainedPositions: Array<{
    playerPosition: number;
    playerTrainedPositionAdaptation: number;
  }>;
  playerTrainedRoles: Array<{
    playerRole: number;
    playerTrainedRoleAdaptation: number;
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
  startDate: string;
  endDate: string;
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
    MatCard,
    MatCardContent,
    MatButtonModule,
    MatIconModule,
    DataTable
  ],
  templateUrl: './player-details.html',
  styleUrl: './player-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerDetails implements OnInit, OnDestroy {
  playerDetails: PlayerDetailsResponse | null = null;
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
    { key: 'team', header: 'Team', width: '40%' },
    { key: 'startDate', header: 'Start Date', width: '30%' },
    { key: 'endDate', header: 'End Date', width: '30%' }
  ];

  transformedPositions: TransformedPosition[] = [];
  transformedRoles: TransformedRole[] = [];
  transformedContracts: TransformedContract[] = [];
  transformedStats: TransformedStat[] = [];

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
          this.playerName = `${data.person?.name || ''} ${data.person?.surname || ''}`.trim();
          this.dateOfBirth = this.formatDateOfBirth(data.person?.dateOfBirth);
          this.age = this.calculateAge(data.person?.dateOfBirth);
          this.placeOfBirth = data.person?.placeOfBirth || '';
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
    if (this.playerDetails?.person?.contracts) {
      this.transformedContracts = this.playerDetails.person.contracts
        .map(c => ({
          team: c.team?.name || 'Unknown',
          startDate: this.formatDate(c.startDate),
          endDate: this.formatDate(c.endDate)
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
            { name: 'Kicking', value: stats.kicking }
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
        },
        {
          category: 'Defensive',
          stats: [
            { name: 'Tackling', value: stats.tackling }
          ]
        },
        {
          category: 'Goalkeeping',
          stats: [
            { name: 'Goalkeeping', value: stats.goalkeeping }
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

  private calculateAge(dateString: string | undefined): number | null {
    if (!dateString) return null;
    const birthDate = new Date(dateString);
    
    if (isNaN(birthDate.getTime())) return null;
    
    const today = new Date();
    const birthUTC = new Date(Date.UTC(
      birthDate.getUTCFullYear(),
      birthDate.getUTCMonth(),
      birthDate.getUTCDate()
    ));
    const todayUTC = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    ));
    
    let age = todayUTC.getUTCFullYear() - birthUTC.getUTCFullYear();
    const monthDiff = todayUTC.getUTCMonth() - birthUTC.getUTCMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && todayUTC.getUTCDate() < birthUTC.getUTCDate())) {
      age--;
    }
    
    return age;
  }

  goBack(): void {
    this.router.navigate(['/team/squad']);
  }
}
