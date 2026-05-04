/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DataTable } from '../shared/tables/data-table/data-table';
import { CompetitionService } from '../../services/competition.service';
import { Competition, CompetitionType } from '../../models/competition.model';

@Component({
  selector: 'app-competition-details',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    DataTable
  ],
  templateUrl: './competition-details.html',
  styleUrl: './competition-details.css'
})
export class CompetitionDetails implements OnInit {
  competition = signal<Competition | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  displayedColumns = [
    { key: 'name', header: 'Team Name', width: '40%', sortable: true },
    { key: 'country', header: 'Country', sortable: true },
    { key: 'stadium', header: 'Stadium', width: '30%' }
  ];

  teams = signal<any[]>([]);

  constructor(
    private route: ActivatedRoute,
    private competitionService: CompetitionService
  ) {}

  ngOnInit(): void {
    const competitionId = this.route.snapshot.paramMap.get('id');
    if (competitionId) {
      this.loadCompetition(competitionId);
    } else {
      this.error.set('No competition ID provided');
      this.loading.set(false);
    }
  }

  loadCompetition(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.competitionService.getById(id).subscribe({
      next: (competition) => {
        this.competition.set(competition);
        // Extract teams from competition if available
        if (competition.teams && competition.teams.length > 0) {
          this.teams.set(competition.teams);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading competition:', err);
        this.error.set('Failed to load competition details');
        this.loading.set(false);
      }
    });
  }

  getParentName(competition: Competition): string | null {
    return competition.nation?.name ?? competition.continent?.name ?? null;
  }

  getCompetitionTypeLabel(type: CompetitionType | undefined): string {
    switch (type) {
      case CompetitionType.League:
        return 'League';
      case CompetitionType.Knockout:
        return 'Knockout';
      case CompetitionType.Mixed:
        return 'Mixed';
      default:
        return 'Unknown';
    }
  }
}
