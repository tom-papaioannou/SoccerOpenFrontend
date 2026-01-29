import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'app-tactics',
  imports: [],
  templateUrl: './tactics.html',
  styleUrl: './tactics.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tactics {

  constructor(private readonly cdr: ChangeDetectorRef){

  }
}
