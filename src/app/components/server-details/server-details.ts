/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataTable } from '../shared/tables/data-table/data-table';
import { ServerService } from '../../services/server.service';
import { IServerInfo } from '../../models/server.model';

@Component({
  selector: 'app-server-details',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DataTable
  ],
  templateUrl: './server-details.html',
  styleUrl: './server-details.css'
})
export class ServerDetails implements OnInit {
  server = signal<IServerInfo | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  personColumns = [
    { key: 'personID', header: 'Person ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true }
  ];

  competitionColumns = [
    { key: 'competitionID', header: 'Competition ID', sortable: true },
    { key: 'competitionName', header: 'Competition Name', sortable: true }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serverService: ServerService
  ) {}

  ngOnInit(): void {
    const serverID = this.route.snapshot.paramMap.get('id');
    if (serverID) {
      this.loadServer(serverID);
    } else {
      this.error.set('No server ID provided');
      this.loading.set(false);
    }
  }

  loadServer(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.serverService.getServerInformation(id).subscribe({
      next: (server) => {
        this.server.set(server);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading server:', err);
        this.error.set('Failed to load server details');
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/servers']);
  }
}
