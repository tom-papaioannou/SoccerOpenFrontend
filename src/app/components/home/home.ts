/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { DataTable } from '../shared/tables/data-table/data-table';
import { TeamsService } from '../../services/teams.service';
import { calculateAge } from '../../utils/date-utils';
import { getPlayerPositionLabel } from '../../utils/position-utils';
import { Kit } from '../../models/competition.model';
import { TeamKit } from '../team-kit/team-kit';
import { Information } from '../team/information/information';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DataTable,
    TeamKit,
    Information
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  teamName: string = "";
  kit: Kit | undefined;
  competitionName: string = "";

  displayedColumnsFixtures = [
    { key: 'date', header: 'Date', width: '15%', sortable: undefined },
    { key: 'homeaway', width: '5%', sortable: false },
    { key: 'team', header: 'Team', align: 'end', headerClass:'text-end', cellClass:'text-end', sortable: false }
  ];
  fixtures = [
    { date: '15/06', homeaway: 'H', team: "Red Ones" },
    { date: '19/06', homeaway: 'A', team: "Blue Team" },
    { date: '26/06', homeaway: 'H', team: "The Green Flag" },
    { date: '30/06', homeaway: 'H', team: "The Orange Pirates" },
    { date: '5/07', homeaway: 'A', team: "The Old Purple" },
    { date: '9/07', homeaway: 'H', team: "The White Swan" },
  ];

  displayedColumns = [
    { key: 'name', header: 'Name', width: '30%' },
    { key: 'position', header: 'Position' },
    { key: 'age', header: 'Age', align: 'end', headerClass:'text-end', cellClass:'text-end' }
  ];
  people: Array<any> = [];
  showPlayersTable = false;

  constructor(private readonly teamsService: TeamsService, private readonly cdr: ChangeDetectorRef){
    this.teamName = this.teamsService.CurrentTeam?.name ?? "Unknown Team";
    this.teamsService.getCurrentTeamDashboard().subscribe((dashboard) => {
      this.teamName = dashboard.teamName;
      this.competitionName = dashboard.competitionName;
      this.kit = dashboard.kit;
      (dashboard.players as Array<any>).forEach(element => {
        this.people.push({ name: element.name, age: calculateAge(element.dateOfBirth), position: getPlayerPositionLabel(element.playerTrainedPositions[0].playerPosition) });
      });
      this.showPlayersTable = true;
      this.cdr.detectChanges();
    });
  }
}
