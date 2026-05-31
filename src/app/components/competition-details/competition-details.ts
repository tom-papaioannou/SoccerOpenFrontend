/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Component, OnInit, TemplateRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { ColumnDef, DataTable } from '../shared/tables/data-table/data-table';
import { CompetitionService } from '../../services/competition.service';
import { Competition, CompetitionTableRow } from '../../models/competition.model';
import { Card } from '../shared/cards/card/card';

@Component({
  selector: 'app-competition-details',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    DataTable,
    Card
  ],
  templateUrl: './competition-details.html',
  styleUrl: './competition-details.css'
})
export class CompetitionDetails implements OnInit {
  @ViewChild('teamNameTemplate', { static: true }) teamNameTemplate!: TemplateRef<{ $implicit: CompetitionTableRow; value: string }>;
  @ViewChild('yellowCardHeaderTemplate', { static: true }) yellowCardHeaderTemplate!: TemplateRef<void>;
  @ViewChild('redCardHeaderTemplate', { static: true }) redCardHeaderTemplate!: TemplateRef<void>;

  competition = signal<Competition | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  displayedColumns: ColumnDef<CompetitionTableRow>[] = [];

  tableRows = signal<CompetitionTableRow[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private competitionService: CompetitionService
  ) {}

  ngOnInit(): void {
    this.displayedColumns = [
      { key: 'position', header: '', width: '6%' },
      { key: 'teamName', header: 'Team', width: '34%', cellTemplate: this.teamNameTemplate },
      { key: 'points', header: 'P', width: '8%' },
      { key: 'wins', header: 'W', width: '8%' },
      { key: 'draws', header: 'D', width: '8%' },
      { key: 'losses', header: 'L', width: '8%' },
      { key: 'yellowCards', header: 'YC', width: '8%', headerTemplate: this.yellowCardHeaderTemplate },
      { key: 'redCards', header: 'RC', width: '8%', headerTemplate: this.redCardHeaderTemplate },
      { key: 'matchesPlayed', header: 'MP', width: '12%' }
    ];

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

    forkJoin({
      competition: this.competitionService.getById(id),
      tableRows: this.competitionService.getCompetitionTable(id)
    }).subscribe({
      next: ({ competition, tableRows }) => {
        this.competition.set(competition);
        this.tableRows.set(tableRows);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading competition:', err);
        this.error.set('Failed to load competition details');
        this.loading.set(false);
      }
    });
  }

  openNationCompetitions(competition: Competition): void {
    if (competition.nationID) {
      this.router.navigate(['/nations', competition.nationID, 'competitions']);
    }
  }

  openTeamSquad(row: CompetitionTableRow): void {
    if (row.teamID) {
      this.router.navigate(['/team', row.teamID, 'squad']);
    }
  }
}
