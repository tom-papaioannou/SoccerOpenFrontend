import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataTable, ColumnDef } from '../../shared/tables/data-table/data-table';
import { FormTextfield } from '../../shared/textfields/form-textfield/form-textfield';
import { TacticsService } from '../../../services/tactics.service';
import { Tactic, CreateTacticRequest } from '../../../models/tactic.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tactics',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatButtonModule,
    MatIconModule,
    DataTable,
    FormTextfield
  ],
  templateUrl: './tactics.html',
  styleUrl: './tactics.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tactics implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  
  // TODO: Get team ID from route params or auth service
  // For now using a placeholder that needs to be set
  private teamId = '00000000-0000-0000-0000-000000000000'; 
  
  // State signals
  tactics = signal<Tactic[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  createMode = signal(false);

  // Form
  tacticForm: FormGroup;

  // Table columns - updated to match backend property names
  displayedColumns: ColumnDef<Tactic>[] = [
    { key: 'Name', header: 'Name', width: '30%', sortable: true },
    { key: 'Formation', header: 'Formation', width: '25%', sortable: true },
    { key: 'Description', header: 'Description', width: '45%' }
  ];

  constructor(
    private readonly tacticsService: TacticsService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.tacticForm = this.fb.group({
      Name: ['', [Validators.required, Validators.minLength(3)]],
      Formation: [''],
      Description: ['']
    });
  }

  ngOnInit(): void {
    this.loadTactics();
  }

  loadTactics(): void {
    this.loading.set(true);
    this.error.set(null);

    this.tacticsService.getTeamTactics(this.teamId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tactics) => {
          this.tactics.set(tactics);
          this.loading.set(false);
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load tactics');
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  createNew(): void {
    this.createMode.set(true);
    this.tacticForm.reset();
    this.cdr.markForCheck();
  }

  saveTactic(): void {
    if (!this.tacticForm.valid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.tacticForm.value;
    
    const createRequest: CreateTacticRequest = {
      TeamID: this.teamId,
      Name: formValue.Name,
      Formation: formValue.Formation,
      Description: formValue.Description
    };

    this.tacticsService.createTeamTactic(createRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.createMode.set(false);
          this.tacticForm.reset();
          this.loadTactics();
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to create tactic');
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  cancel(): void {
    this.createMode.set(false);
    this.tacticForm.reset();
    this.cdr.markForCheck();
  }
}
