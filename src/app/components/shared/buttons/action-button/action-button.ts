import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-action-button',
  imports: [MatButtonModule],
  templateUrl: './action-button.html',
  styleUrl: './action-button.css'
})
export class ActionButton {
  @Output() clicked = new EventEmitter<void>();
  @Input() buttonText: string | undefined;
  @Input() disabled: boolean = false;
  @Input() variant: 'primary' | 'secondary' = 'primary';

  buttonClicked(){
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
