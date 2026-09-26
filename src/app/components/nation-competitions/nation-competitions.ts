import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NationCompetition, NationSquadPlayer, NationDetails } from '../../models/nation.model';
import { NationService } from '../../services/nation.service';
import { DataTable, ColumnDef } from '../shared/tables/data-table/data-table';
import { getCompetitionTypeLabel, getNationFlagUrl } from '../../utils/nation-map-utils';
import { getGroupedPlayerPositionLabel, getPlayerRoleLabel } from '../../utils/position-utils';
import { PlayerPosition, PlayerRole } from '../../models/player-enums.model';
import { calculateAge } from '../../utils/date-utils';

interface SquadRow {
  personID: string;
  name: string;
  position: string;
  role: string;
  age: number | string;
  contract: string;
  positionValue?: PlayerPosition;
}

@Component({
  selector: 'app-nation-competitions',
  imports: [MatButtonModule, MatIconModule, DataTable],
  templateUrl: './nation-competitions.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './nation-competitions.css'
})
export class NationCompetitions implements OnInit {
  nation = signal<NationDetails | null>(null);
  competitions = signal<NationCompetition[]>([]);
  squad = signal<SquadRow[]>([]);
  activeTab = signal<'squad' | 'competitions'>('squad');
  loading = signal(true);
  error = signal<string | null>(null);

  competitionColumns = [
    { key: 'competitionName', header: 'Competition', sortable: true },
    { key: 'typeLabel', header: 'Type', sortable: true },
    { key: 'priority', header: 'Priority', align: 'right', headerClass: 'text-end', cellClass: 'text-end', sortable: true },
    { key: 'teamsCount', header: 'Teams', align: 'right', headerClass: 'text-end', cellClass: 'text-end', sortable: true }
  ];
  squadColumns: ColumnDef<SquadRow>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'position', header: 'Position', sortable: true, sortAccessor: row => row.positionValue },
    { key: 'role', header: 'Role', sortable: true },
    { key: 'age', header: 'Age', sortable: true },
    { key: 'contract', header: 'Contract', sortable: true }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly nationService: NationService
  ) {}

  ngOnInit(): void {
    const nationId = this.route.snapshot.paramMap.get('nationId');
    if (!nationId) {
      this.error.set('No nation selected');
      this.loading.set(false);
      return;
    }

    this.nationService.getDetails(nationId).subscribe({
      next: details => {
        this.nation.set(details);
        this.competitions.set(details.competitions.map(c => ({
          ...c,
          typeLabel: getCompetitionTypeLabel(c.competitionType)
        })) as NationCompetition[]);
        this.squad.set(details.squad.map(player => this.toSquadRow(player)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load nation details');
        this.loading.set(false);
      }
    });
  }

  openCompetition(competition: NationCompetition): void {
    this.router.navigate(['/competition', competition.competitionID]);
  }

  openPlayer(player: SquadRow): void {
    this.router.navigate(['/player', player.personID]);
  }

  goBack(): void {
    this.router.navigate(['/world-map']);
  }

  nationFlagUrl(): string | null {
    const selectedNation = this.nation();
    return selectedNation ? getNationFlagUrl(selectedNation) : null;
  }

  private toSquadRow(player: NationSquadPlayer): SquadRow {
    const bestPosition = [...(player.playerTrainedPositions ?? [])]
      .sort((a, b) => b.playerTrainedPositionAdaptation - a.playerTrainedPositionAdaptation)[0]?.playerPosition as PlayerPosition | undefined;
    const bestRole = [...(player.playerTrainedRoles ?? [])]
      .filter(role => role.playerPosition === bestPosition)
      .sort((a, b) => b.playerTrainedRoleAdaptation - a.playerTrainedRoleAdaptation)[0]?.playerRole as PlayerRole | undefined;
    return {
      personID: player.personID,
      name: `${player.name ?? ''} ${player.surname ?? ''}`.trim() || 'Unknown',
      position: getGroupedPlayerPositionLabel(bestPosition),
      positionValue: bestPosition,
      role: getPlayerRoleLabel(bestRole),
      age: player.dateOfBirth ? (calculateAge(player.dateOfBirth) ?? '-') : '-',
      contract: player.endDate ? new Date(player.endDate).toLocaleDateString() : '-'
    };
  }
}
