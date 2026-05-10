/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-team-kit',
  imports: [
    CommonModule
  ],
  templateUrl: './team-kit.html',
  styleUrl: './team-kit.css',
  standalone: true
})
export class TeamKit {
  @Input() kit: any;
  @Input() isHome: boolean = true;
}
