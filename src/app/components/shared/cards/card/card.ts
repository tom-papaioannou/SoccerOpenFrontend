/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { booleanAttribute, Component, Input } from '@angular/core';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-card',
  imports: [MatCard],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class Card {
  @Input() appearance: 'outlined' | 'raised' | 'filled' = 'outlined';
  @Input({ transform: booleanAttribute }) hoverable = false;
}
