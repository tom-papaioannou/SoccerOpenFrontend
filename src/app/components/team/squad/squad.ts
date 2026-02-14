import { Component, OnInit } from '@angular/core';
import { DataTable } from "../../shared/tables/data-table/data-table";
import { TeamsService } from '../../../services/teams.service';
import { Player } from '../../../models/player-enums.model';

@Component({
  selector: 'app-squad',
  imports: [
    DataTable
  ],
  templateUrl: './squad.html',
  styleUrl: './squad.css'
})
export class Squad implements OnInit {
  displayedColumns = [
    { key: 'name', header: 'Name', width: '30%', sortable: true },
    { key: 'position', header: 'Position' },
    { key: 'age', header: 'Age', align: 'end', headerClass:'text-end', cellClass:'text-end' }
  ];
  people: any[] = [];

  constructor(private readonly teamsService: TeamsService) {}

  ngOnInit(): void {
    this.loadPlayers();
  }

  private loadPlayers(): void {
    const currentTeam = this.teamsService.CurrentTeam;
    if (currentTeam?.teamID) {
      this.teamsService.getTeamPlayers(currentTeam.teamID).subscribe({
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
      const person = player.Person;
      let name = 'Unknown';
      if (person && (person.Name || person.Surname)) {
        name = `${person.Name || ''} ${person.Surname || ''}`.trim();
      }
      const age = person?.DateOfBirth ? this.calculateAge(person.DateOfBirth) : null;
      
      return {
        name,
        position: 'N/A', // Position info might need to come from PlayerTactic
        age: age !== null ? age : '-'
      };
    });
  }

  private calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
