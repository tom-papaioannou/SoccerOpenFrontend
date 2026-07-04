/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavbarComponent } from './components/navbar/navbar';
import { AuthService } from './services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { DeviceService } from './services/device.service';
import { TeamsService } from './services/teams.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavbarComponent,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly title = signal('SoccerOpenSimulator');
  isMobile = false;
  private destroy$ = new Subject<void>();
  role: string | null | undefined;
  signedIn = false;
  currentServerID: string = '';

  constructor(
    protected readonly authService: AuthService,
    private deviceService: DeviceService,
    private readonly teamsService: TeamsService,
    private router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.deviceService.isMobile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => {
        this.isMobile = v;
        this.cdr.markForCheck();
      });

    this.authService.server$.subscribe((value) => {
      this.currentServerID = value ?? '';
      this.cdr.markForCheck();
    });

    this.signedIn = this.authService.isLoggedIn();
    if(this.signedIn){
      this.role = this.authService.getRole();
      this.authService.fetchAndStoreServerID();
      if(this.role === "User"){
        this.teamsService.getCurrentTeam().subscribe({
          next: (result) => {
            this.teamsService.CurrentTeam = result;
          },
          error: (error) => {
            console.error("Error fetching current team:", error);
          }
        });
      }
    }

    this.authService.authenticationChange?.subscribe({
      next:() => {
        this.signedIn = this.authService.isLoggedIn();
        this.role = this.authService.getRole();
        if(this.signedIn){
          this.authService.fetchAndStoreServerID();
        }
        if(this.role === "User"){
          this.teamsService.getCurrentTeam().subscribe({
            next: (result) => {
              this.teamsService.CurrentTeam = result;
            },
            error: (error) => {
              console.error("Error fetching current team:", error);
            }
          });
        }
        this.cdr.markForCheck();
      }
    });
  }

  logOut(){
    this.authService.logOut().subscribe({
      next: (result) => {
        this.router.navigate(['/login']);
      },
      error: (error) => {

      }
    });
  }
}
