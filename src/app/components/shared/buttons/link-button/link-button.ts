/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-link-button',
  imports: [MatButtonModule],
  templateUrl: './link-button.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './link-button.css'
})
export class LinkButton {
  @Output() clicked = new EventEmitter<void>();
  @Input() buttonText: string | undefined;

  buttonClicked(){
    console.log("click!");
    this.clicked.emit();
  }
}
