/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Component } from '@angular/core';
import { DataTable } from '../shared/tables/data-table/data-table';
import { TeamsService } from '../../services/teams.service';

@Component({
  selector: 'app-home',
  imports: [
    DataTable
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  teamName: string = "";

  constructor(private readonly teamsService: TeamsService){
    this.teamName = this.teamsService.CurrentTeam?.name ?? "Unknown Team";
  }

  displayedColumnsFixtures = [
    { key: 'date', header: 'Date', width: '15%', sortable: undefined },
    { key: 'homeaway', width: '5%', sortable: false },
    { key: 'team', header: 'Team', align: 'end', headerClass:'text-end', cellClass:'text-end', sortable: false }
  ];
  fixtures = [
    { date: '15/06', homeaway: 'H', team: "Red Ones" },
    { date: '19/06', homeaway: 'A', team: "Blue Team" },
    { date: '26/06', homeaway: 'H', team: "The Green Flag" },
  ];

  displayedColumns = [
    { key: 'name', header: 'Name', width: '30%' },
    { key: 'position', header: 'Position' },
    { key: 'age', header: 'Age', align: 'end', headerClass:'text-end', cellClass:'text-end' }
  ];
  people = [
    { name: 'Alice Johnson', age: 25, position: "CF" },
    { name: 'Bob Brown', age: 32, position: "CD" },
    { name: 'Charlie Core', age: 28, position: "GK" },
  ];
}
