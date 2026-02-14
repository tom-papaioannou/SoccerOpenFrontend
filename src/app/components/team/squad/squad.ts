import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataTable } from "../../shared/tables/data-table/data-table";
import { TeamsService } from '../../../services/teams.service';
import { Player } from '../../../models/player-enums.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-squad',
  imports: [
    DataTable
  ],
  templateUrl: './squad.html',
  styleUrl: './squad.css'
})
export class Squad implements OnInit, OnDestroy {
  displayedColumns = [
    { key: 'name', header: 'Name', width: '30%', sortable: true },
    { key: 'position', header: 'Position' },
    { key: 'age', header: 'Age', align: 'end', headerClass:'text-end', cellClass:'text-end' }
  ];
  people: any[] = [];
  private subscription?: Subscription;

  constructor(private readonly teamsService: TeamsService) {}

  ngOnInit(): void {
    this.loadPlayers();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private loadPlayers(): void {
    const currentTeam = this.teamsService.CurrentTeam;
    if (currentTeam?.teamID) {
      this.subscription = this.teamsService.getTeamSquad(currentTeam.teamID).subscribe({
        next: (players: Player[]) => {
          this.people = this.transformPlayers(players);
        },
        error: (error) => {
          console.error('Error fetching players:', error);
          // Keep empty array on error
          this.people = [];
        }
      });
    }
  }

  private transformPlayers(players: Player[]): any[] {
    return players.map(player => {
      const person = player.person;
      let name = 'Unknown';
      if (person && (person.name || person.surname)) {
        name = `${person.name || ''} ${person.surname || ''}`.trim();
      }
      const age = person?.dateOfBirth ? this.calculateAge(person.dateOfBirth) : null;
      
      return {
        name,
        position: 'N/A', // Position info might need to come from PlayerTactic
        age: age !== null ? age : '-'
      };
    });
  }

  private calculateAge(dateOfBirth: string): number | null {
    const birthDate = new Date(dateOfBirth);
    
    // Validate the date
    if (isNaN(birthDate.getTime())) {
      return null;
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
