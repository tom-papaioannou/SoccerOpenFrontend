/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { AuthService, CurrentUserSummary } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  @Input() isMobile = false;
  role = '';
  loggedIn: boolean;
  currentUser: CurrentUserSummary | null = null;

  constructor(
    private router: Router,
    protected readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ){
    this.loggedIn = this.authService.isLoggedIn();
    this.role = this.authService.getRole();

    this.authService.currentUser$.subscribe({
      next: (currentUser) => {
        this.currentUser = currentUser;
        this.cdr.markForCheck();
      }
    });

    if (this.loggedIn) {
      this.authService.loadCurrentUserSummary();
    }

    this.authService.authenticationChange?.subscribe({
      next:() => {
        this.role = this.authService.getRole();
        this.loggedIn = this.authService.isLoggedIn();
        if (this.loggedIn) {
          this.authService.loadCurrentUserSummary();
        } else {
          this.currentUser = null;
        }
        this.cdr.markForCheck();
      }
    });
  }

  get profileSubtitle(): string {
    const role = this.currentUser?.role || this.role;

    if (role === 'Admin') {
      return 'Admin';
    }

    if (role === 'Host') {
      return `${this.currentUser?.serverName ?? 'Server'} - Host`;
    }

    if (role === 'User') {
      return `${this.currentUser?.teamName ?? 'Team'} - Manager`;
    }

    return role;
  }

  testConnection(){
    this.authService.testConnection().subscribe({
      next: (result) => {
        console.log("Connection test result:", result);
      },
      error: (error) => {
        console.error("Connection test error:", error);
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
