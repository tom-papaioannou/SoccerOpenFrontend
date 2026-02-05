import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal, computed, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
    MatCheckboxModule,
    FormTextfield
  ],
  templateUrl: './tactics.html',
  styleUrl: './tactics.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tactics implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly MAX_TACTICS = 3;
  
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

  // Computed values
  canCreateNewTactic = computed(() => this.tactics().length < this.MAX_TACTICS);
  tacticsRemaining = computed(() => this.MAX_TACTICS - this.tactics().length);

  constructor(
    private readonly tacticsService: TacticsService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.tacticForm = this.fb.group({
      Name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      isMain: [false]
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
    if (!this.canCreateNewTactic()) {
      this.error.set(`Maximum of ${this.MAX_TACTICS} tactics reached. You cannot create more tactics.`);
      return;
    }
    
    this.createMode.set(true);
    this.tacticForm.reset({ isMain: false });
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
      isMain: formValue.isMain ?? false
    };

    this.tacticsService.createTeamTactic(createRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.createMode.set(false);
          this.tacticForm.reset({ isMain: false });
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
    this.tacticForm.reset({ isMain: false });
    this.cdr.markForCheck();
  }
}
