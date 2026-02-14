import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataTable } from "../../shared/tables/data-table/data-table";
import { TeamsService } from '../../../services/teams.service';
import { Player, PlayerPosition } from '../../../models/player-enums.model';
import { Subject, takeUntil } from 'rxjs';
import { getPlayerPositionLabel } from '../../../utils/position-utils';

interface TransformedPlayer {
  name: string;
  position: string;
  positionValue?: PlayerPosition;
  age: number | string;
}

@Component({
  selector: 'app-squad',
  imports: [
    DataTable
  ],
  templateUrl: './squad.html',
  styleUrl: './squad.css'
})
export class Squad implements OnInit, OnDestroy {
  // Position sort order map - defines the tactical field layout order
  private readonly positionSortOrder: Record<number, number> = {
    [PlayerPosition.Goalkeeper]: 1,
    [PlayerPosition.LeftBack]: 2,
    [PlayerPosition.CenterBack]: 3,
    [PlayerPosition.RightBack]: 4,
    [PlayerPosition.LeftWingBack]: 5,
    [PlayerPosition.DefensiveMidfielder]: 6,
    [PlayerPosition.RightWingBack]: 7,
    [PlayerPosition.LeftMidfielder]: 8,
    [PlayerPosition.CentralMidfielder]: 9,
    [PlayerPosition.RightMidfielder]: 10,
    [PlayerPosition.LeftWinger]: 11,
    [PlayerPosition.AttackingMidfielder]: 12,
    [PlayerPosition.RightWinger]: 13,
    [PlayerPosition.Striker]: 14
  };

  // Custom comparator for position sorting
  private positionComparator = (a: unknown, b: unknown): number => {
    const aOrder = this.positionSortOrder[a as number] ?? 999;
    const bOrder = this.positionSortOrder[b as number] ?? 999;
    return aOrder - bOrder;
  };

  displayedColumns = [
    { key: 'name', header: 'Name', width: '30%', sortable: true },
    { 
      key: 'position', 
      header: 'Position',
      sortable: true,
      sortAccessor: (row: TransformedPlayer) => row.positionValue,
      comparator: this.positionComparator
    },
    { key: 'age', header: 'Age', align: 'end', headerClass:'text-end', cellClass:'text-end' }
  ];
  people: TransformedPlayer[] = [];
  private destroy$ = new Subject<void>();

  constructor(private readonly teamsService: TeamsService) {}

  ngOnInit(): void {
    // Subscribe to currentTeamObservable to wait for team to be set
    this.teamsService.currentTeamObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (team) => {
          if (team?.teamID) {
            this.loadPlayers(team.teamID);
          }
        },
        error: (error) => {
          console.error('Error getting current team:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPlayers(teamID: string): void {
    this.teamsService.getTeamSquad(teamID)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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

  private transformPlayers(players: Player[]): TransformedPlayer[] {
    return players.map(player => {
      const person = player.person;
      let name = 'Unknown';
      if (person && (person.name || person.surname)) {
        name = `${person.name || ''} ${person.surname || ''}`.trim();
      }
      const age = person?.dateOfBirth ? this.calculateAge(person.dateOfBirth) : null;
      
      // Get the player's best position (highest adaptation)
      const bestPosition = this.getBestPlayerPosition(player);
      
      return {
        name,
        position: getPlayerPositionLabel(bestPosition),
        positionValue: bestPosition, // Include raw enum value for sorting
        age: age !== null ? age : '-'
      };
    });
  }

  private getBestPlayerPosition(player: Player): PlayerPosition | undefined {
    if (!player.playerTrainedPositions || player.playerTrainedPositions.length === 0) {
      return undefined;
    }

    // Sort by adaptation (descending) and get the first one
    const sorted = [...player.playerTrainedPositions].sort(
      (a, b) => b.playerTrainedPositionAdaptation - a.playerTrainedPositionAdaptation
    );
    
    return sorted[0].playerPosition;
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
