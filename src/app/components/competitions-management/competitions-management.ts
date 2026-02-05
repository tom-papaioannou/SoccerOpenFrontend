import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormTextfield } from '../shared/textfields/form-textfield/form-textfield';
import { CompetitionParentService } from '../../services/competition-parent.service';
import { CompetitionParent, CreateCompetitionParentRequest } from '../../models/competition-parent.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-competitions-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    FormTextfield
  ],
  templateUrl: './competitions-management.html',
  styleUrl: './competitions-management.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompetitionsManagement implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  
  // State signals
  competitionParents = signal<CompetitionParent[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  createMode = signal(false);

  // Form
  competitionParentForm: FormGroup;

  // Available types for dropdown
  competitionTypes: ('Nation' | 'Continent' | 'World')[] = ['Nation', 'Continent', 'World'];

  constructor(
    private readonly competitionParentService: CompetitionParentService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.competitionParentForm = this.fb.group({
      Name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      Type: ['Nation', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCompetitionParents();
  }

  loadCompetitionParents(): void {
    this.loading.set(true);
    this.error.set(null);

    this.competitionParentService.getAllCompetitionParents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (competitionParents) => {
          this.competitionParents.set(competitionParents);
          this.loading.set(false);
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load competition parents');
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  createNew(): void {
    this.createMode.set(true);
    this.competitionParentForm.reset({ Type: 'Nation' });
    this.cdr.markForCheck();
  }

  saveCompetitionParent(): void {
    if (!this.competitionParentForm.valid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.competitionParentForm.value;
    
    const createRequest: CreateCompetitionParentRequest = {
      Name: formValue.Name,
      Type: formValue.Type
    };

    this.competitionParentService.createCompetitionParent(createRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.createMode.set(false);
          this.competitionParentForm.reset({ Type: 'Nation' });
          this.loadCompetitionParents();
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to create competition parent');
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  cancel(): void {
    this.createMode.set(false);
    this.competitionParentForm.reset({ Type: 'Nation' });
    this.cdr.markForCheck();
  }

  deleteCompetitionParent(competitionParent: CompetitionParent, event: Event): void {
    // Prevent card click event from triggering
    event.stopPropagation();
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the competition parent "${competitionParent.name}"?`)) {
      return;
    }

    if (!competitionParent.competitionParentID) {
      this.error.set('Cannot delete competition parent: missing ID');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.competitionParentService.deleteCompetitionParent(competitionParent.competitionParentID)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.loadCompetitionParents();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to delete competition parent');
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      });
  }
}