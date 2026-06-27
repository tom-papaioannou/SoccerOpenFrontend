/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subject, map, switchMap, takeUntil } from 'rxjs';
import { ColumnDef, DataTable } from '../shared/tables/data-table/data-table';
import { CompetitionService } from '../../services/competition.service';
import { Competition, CompetitionTableRow, CompetitionType, CupBracket } from '../../models/competition.model';
import { Card } from '../shared/cards/card/card';
import { CupBracketComponent } from '../cup-bracket/cup-bracket';
import { TeamsService } from '../../services/teams.service';

@Component({
  selector: 'app-competition-details',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    DataTable,
    Card,
    CupBracketComponent
  ],
  templateUrl: './competition-details.html',
  styleUrl: './competition-details.css'
})
export class CompetitionDetails implements OnInit, OnDestroy {
  @ViewChild('teamNameTemplate', { static: true }) teamNameTemplate!: TemplateRef<{ $implicit: CompetitionTableRow; value: string }>;
  @ViewChild('yellowCardHeaderTemplate', { static: true }) yellowCardHeaderTemplate!: TemplateRef<void>;
  @ViewChild('redCardHeaderTemplate', { static: true }) redCardHeaderTemplate!: TemplateRef<void>;

  competition = signal<Competition | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  displayedColumns: ColumnDef<CompetitionTableRow>[] = [];

  tableRows = signal<CompetitionTableRow[]>([]);
  cupBracket = signal<CupBracket | null>(null);
  currentUserTeamID = signal<string | null>(null);
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private competitionService: CompetitionService,
    private teamsService: TeamsService
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

    this.currentUserTeamID.set(this.teamsService.CurrentTeam?.teamID ?? null);
    this.teamsService.currentTeamObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe(team => this.currentUserTeamID.set(team.teamID ?? null));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCompetition(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.competition.set(null);
    this.tableRows.set([]);
    this.cupBracket.set(null);

    this.competitionService.getById(id).pipe(
      switchMap(competition => {
        this.competition.set(competition);

        if (competition.competitionType === CompetitionType.Knockout) {
          return this.competitionService.getCupBracket(id).pipe(
            map(cupBracket => ({
              cupBracket,
              tableRows: [] as CompetitionTableRow[]
            }))
          );
        }

        return this.competitionService.getCompetitionTable(id).pipe(
          map(tableRows => ({
            cupBracket: null as CupBracket | null,
            tableRows
          }))
        );
      })
    ).subscribe({
      next: ({ cupBracket, tableRows }) => {
        this.cupBracket.set(cupBracket);
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

  openTeamSquadByID(teamID: string): void {
    this.router.navigate(['/team', teamID, 'squad']);
  }

  isCupCompetition(): boolean {
    return this.competition()?.competitionType === CompetitionType.Knockout;
  }

  isUserTeam(teamID?: string | null): boolean {
    return !!teamID && teamID === this.currentUserTeamID();
  }
}
