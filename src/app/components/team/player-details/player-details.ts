import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

import { TeamsService } from '../../../services/teams.service';
import { DataTable } from '../../shared/tables/data-table/data-table';
import { getPlayerPositionLabel, getPlayerRoleLabel } from '../../../utils/position-utils';

interface PlayerDetailsResponse {
  person: {
    name: string;
    surname: string;
    contracts: Array<{
      startDate: string;
      endDate: string;
      team: {
        name: string;
      };
    }>;
  };
  playerStats: any;
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
export class PlayerDetails implements OnInit {
  playerDetails: PlayerDetailsResponse | null = null;
  playerName = '';
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
          this.transformPositions();
          this.transformRoles();
          this.transformContracts();
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

  private formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/team/squad']);
  }
}
