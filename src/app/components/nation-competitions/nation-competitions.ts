/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Competition } from '../../models/competition.model';
import { INation } from '../../models/nation.model';
import { CompetitionService } from '../../services/competition.service';
import { NationService } from '../../services/nation.service';
import { DataTable } from '../shared/tables/data-table/data-table';
import { getCompetitionTypeLabel } from '../../utils/nation-map-utils';

@Component({
  selector: 'app-nation-competitions',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    DataTable
  ],
  templateUrl: './nation-competitions.html',
  styleUrl: './nation-competitions.css'
})
export class NationCompetitions implements OnInit {
  nation = signal<INation | null>(null);
  competitions = signal<Competition[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  columns = [
    { key: 'competitionName', header: 'Competition', sortable: true },
    { key: 'typeLabel', header: 'Type', sortable: true },
    { key: 'priority', header: 'Priority', align: 'right', headerClass: 'text-end', cellClass: 'text-end', sortable: true },
    { key: 'teamsCount', header: 'Teams', align: 'right', headerClass: 'text-end', cellClass: 'text-end', sortable: true }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly nationService: NationService,
    private readonly competitionService: CompetitionService
  ) {}

  ngOnInit(): void {
    const nationId = this.route.snapshot.paramMap.get('nationId');
    if (!nationId) {
      this.error.set('No nation selected');
      this.loading.set(false);
      return;
    }

    this.loadNation(nationId);
    this.loadCompetitions(nationId);
  }

  openCompetition(competition: Competition): void {
    if (competition.competitionID) {
      this.router.navigate(['/competition', competition.competitionID]);
    }
  }

  goBack(): void {
    this.router.navigate(['/world-map']);
  }

  private loadNation(nationId: string): void {
    this.nationService.getAll().subscribe({
      next: (nations) => {
        this.nation.set(nations.find(nation => nation.nationID === nationId) ?? null);
      }
    });
  }

  private loadCompetitions(nationId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.competitionService.getByNation(nationId).subscribe({
      next: (competitions) => {
        this.competitions.set(competitions.map(competition => ({
          ...competition,
          typeLabel: getCompetitionTypeLabel(competition.competitionType),
          teamsCount: competition.teams?.length ?? 0
        } as Competition)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load competitions');
        this.loading.set(false);
      }
    });
  }
}
