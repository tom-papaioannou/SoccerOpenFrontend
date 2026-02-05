import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal, computed, DestroyRef, inject, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataTable, ColumnDef } from '../../shared/tables/data-table/data-table';
import { FormTextfield } from '../../shared/textfields/form-textfield/form-textfield';
import { ActionButton } from '../../shared/buttons/action-button/action-button';
import { TacticsService } from '../../../services/tactics.service';
import { Tactic, CreateTacticRequest, UpdateTacticRequest } from '../../../models/tactic.model';
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
    FormTextfield,
    ActionButton
  ],
  templateUrl: './tactics.html',
  styleUrl: './tactics.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tactics implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  
  @ViewChild('actionsTemplate', { static: false }) actionsTemplate!: TemplateRef<any>;
  
  // State signals
  tactics = signal<Tactic[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  editMode = signal(false);
  selectedTactic = signal<Tactic | null>(null);

  // Form
  tacticForm: FormGroup;

  // Computed values
  isFormValid = computed(() => this.tacticForm?.valid ?? false);
  hasSelectedTactic = computed(() => this.selectedTactic() !== null);

  // Table columns
  displayedColumns: ColumnDef<Tactic>[] = [
    { key: 'name', header: 'Name', width: '25%', sortable: true },
    { key: 'formation', header: 'Formation', width: '20%', sortable: true },
    { key: 'description', header: 'Description', width: '40%' },
    { key: 'actions', header: 'Actions', width: '15%', align: 'center' }
  ];

  constructor(
    private readonly tacticsService: TacticsService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.tacticForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      formation: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadTactics();
  }

  ngAfterViewInit(): void {
    // Set the template for the actions column after view init
    if (this.actionsTemplate) {
      const actionsCol = this.displayedColumns.find(col => col.key === 'actions');
      if (actionsCol) {
        actionsCol.cellTemplate = this.actionsTemplate;
        this.cdr.markForCheck();
      }
    }
  }

  loadTactics(): void {
    this.loading.set(true);
    this.error.set(null);

    this.tacticsService.getAllTactics()
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
    this.editMode.set(true);
    this.selectedTactic.set(null);
    this.tacticForm.reset();
    this.cdr.markForCheck();
  }

  editTactic(tactic: Tactic): void {
    this.editMode.set(true);
    this.selectedTactic.set(tactic);
    this.tacticForm.patchValue({
      name: tactic.name,
      formation: tactic.formation || '',
      description: tactic.description || ''
    });
    this.cdr.markForCheck();
  }

  deleteTactic(tactic: Tactic): void {
    if (!confirm(`Are you sure you want to delete "${tactic.name}"?`)) {
      return;
    }

    this.loading.set(true);
    this.tacticsService.deleteTactic(tactic.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadTactics();
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to delete tactic');
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  saveTactic(): void {
    if (!this.tacticForm.valid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.tacticForm.value;
    const selected = this.selectedTactic();

    if (selected) {
      // Update existing tactic
      const updateRequest: UpdateTacticRequest = {
        name: formValue.name,
        formation: formValue.formation,
        description: formValue.description
      };

      this.tacticsService.updateTactic(selected.id, updateRequest)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.editMode.set(false);
            this.selectedTactic.set(null);
            this.tacticForm.reset();
            this.loadTactics();
          },
          error: (err) => {
            this.error.set(err.message || 'Failed to update tactic');
            this.loading.set(false);
            this.cdr.markForCheck();
          }
        });
    } else {
      // Create new tactic
      const createRequest: CreateTacticRequest = {
        name: formValue.name,
        formation: formValue.formation,
        description: formValue.description
      };

      this.tacticsService.createTactic(createRequest)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.editMode.set(false);
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
  }

  cancel(): void {
    this.editMode.set(false);
    this.selectedTactic.set(null);
    this.tacticForm.reset();
    this.cdr.markForCheck();
  }
}
