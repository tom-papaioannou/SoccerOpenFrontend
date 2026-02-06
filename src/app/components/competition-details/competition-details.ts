import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataTable } from '../shared/tables/data-table/data-table';
import { CompetitionService } from '../../services/competition.service';
import { Competition } from '../../models/competition.model';

@Component({
  selector: 'app-competition-details',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
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
    private router: Router,
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

  goBack(): void {
    this.router.navigate(['/competitions-management']);
  }
}
