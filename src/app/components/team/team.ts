/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LinkButton } from '../shared/buttons/link-button/link-button';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-team',
  imports: [
    CommonModule,
    LinkButton,
    RouterOutlet
  ],
  templateUrl: './team.html',
  styleUrl: './team.css'
})
export class Team {

  constructor(private readonly router: Router) { }

  navigateTo(path: string){
    this.router.navigate([`/${path}`]);
  }
}
