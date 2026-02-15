/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-link-button',
  imports: [MatButtonModule],
  templateUrl: './link-button.html',
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
