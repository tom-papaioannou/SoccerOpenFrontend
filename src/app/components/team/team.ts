/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-team',
  imports: [
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './team.html',
  styleUrl: './team.css'
})
export class Team {
}
