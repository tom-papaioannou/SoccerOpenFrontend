/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LinkButton } from '../shared/buttons/link-button/link-button';

@Component({
  selector: 'app-competitions',
  imports: [
    CommonModule,
    LinkButton,
    RouterOutlet
  ],
  templateUrl: './competitions.html',
  styleUrl: './competitions.css'
})
export class Competitions {

  constructor(private readonly router: Router) { }

  navigateTo(path: string){
    this.router.navigate([`/${path}`]);
  }
}
