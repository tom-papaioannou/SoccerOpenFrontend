import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Team } from '../../../models/competition.model';
import { TeamsService } from '../../../services/teams.service';

@Component({
  selector: 'app-information',
  imports: [CommonModule],
  templateUrl: './information.html',
  styleUrl: './information.css',
})
export class Information implements OnInit, OnDestroy {
  team: Team | undefined;
  private destroy$ = new Subject<void>();

  constructor(private readonly teamsService: TeamsService) {}

  ngOnInit(): void {
    this.team = this.teamsService.CurrentTeam;
    this.teamsService.currentTeamObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe((team) => {
        this.team = team;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
