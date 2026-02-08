import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal, computed, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormTextfield } from '../../shared/textfields/form-textfield/form-textfield';
import { FormDropdown } from '../../shared/dropdowns/form-dropdown/form-dropdown';
import { ActionButton } from '../../shared/buttons/action-button/action-button';
import { TacticsService } from '../../../services/tactics.service';
import { Tactic, CreateTacticRequest, Formation } from '../../../models/tactic.model';
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
    FormTextfield,
    FormDropdown,
    ActionButton
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
  private teamId = 'dc31837f-b9bc-4ae3-a65f-883fff1a4498';
  
  // State signals
  tactics = signal<Tactic[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  createMode = signal(false);

  // Form
  tacticForm: FormGroup;

  // Formation options for dropdown
  formationOptions = [
    // Classic formations
    { value: Formation.Four_Four_Two, label: '4-4-2' },
    { value: Formation.Four_Three_Three, label: '4-3-3' },
    { value: Formation.Three_Five_Two, label: '3-5-2' },
    { value: Formation.Five_Three_Two, label: '5-3-2' },
    { value: Formation.Four_Five_One, label: '4-5-1' },
    // 4 at the back variations
    // { value: Formation.Four_Two_Three_One, label: '4-2-3-1' },
    // { value: Formation.Four_Three_Two_One, label: '4-3-2-1' },
    // { value: Formation.Four_One_Four_One, label: '4-1-4-1' },
    // { value: Formation.Four_Four_One_One, label: '4-4-1-1' },
    // { value: Formation.Four_Two_Two_Two, label: '4-2-2-2' },
    // // 3 at the back
    // { value: Formation.Three_Four_Three, label: '3-4-3' },
    // { value: Formation.Three_Four_Two_One, label: '3-4-2-1' },
    // { value: Formation.Three_Four_One_Two, label: '3-4-1-2' },
    // { value: Formation.Three_Three_Four, label: '3-3-4' },
    // // 5 at the back / wingbacks
    // { value: Formation.Five_Four_One, label: '5-4-1' },
    // { value: Formation.Five_Two_Three, label: '5-2-3' },
    // { value: Formation.Five_Three_One_One, label: '5-3-1-1' },
    // // Uncommon / historical
    // { value: Formation.Four_Six_Zero, label: '4-6-0' },
    // { value: Formation.Two_Three_Five, label: '2-3-5' }
  ];

  // Computed values
  canCreateNewTactic = computed(() => this.tactics().length < this.MAX_TACTICS);
  tacticsRemaining = computed(() => this.MAX_TACTICS - this.tactics().length);
  
  // Sorted tactics with isMain first
  sortedTactics = computed(() => {
    const tacticsList = [...this.tactics()];
    return tacticsList.sort((a, b) => {
      // Sort by isMain descending (true first, then false)
      if (a.isMain === b.isMain) return 0;
      return a.isMain ? -1 : 1;
    });
  });

  constructor(
    private readonly tacticsService: TacticsService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {
    this.tacticForm = this.fb.group({
      Name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
      isMain: [false],
      Formation: [Formation.None, [Validators.required]]
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
    this.tacticForm.reset({ Name: `New Tactic (${this.tactics().length + 1})` , isMain: false, Formation: Formation.Four_Four_Two });
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
      isMain: formValue.isMain ?? false,
      Formation: formValue.Formation
    };

    this.tacticsService.createTeamTactic(createRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.createMode.set(false);
          this.tacticForm.reset({ isMain: false, Formation: Formation.None });
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
    this.tacticForm.reset({ isMain: false, Formation: Formation.None });
    this.cdr.markForCheck();
  }

  deleteTactic(tactic: Tactic, event: Event): void {
    // Prevent card click event from triggering
    event.stopPropagation();
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the tactic "${tactic.name}"?`)) {
      return;
    }

    if (!tactic.tacticID) {
      this.error.set('Cannot delete tactic: missing ID');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.tacticsService.deleteTactic(tactic.tacticID)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.loadTactics();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to delete tactic');
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  getFormationImagePath(formation?: Formation): string {
    switch(formation){
      case Formation.Four_Three_Three:
        return 'assets/images/tactics/4-3-3.png';
      case Formation.Three_Five_Two:
        return 'assets/images/tactics/3-5-2.png';
      case Formation.Five_Three_Two:
        return 'assets/images/tactics/5-3-2.png';
      case Formation.Four_Five_One:
        return 'assets/images/tactics/4-5-1.png';
    }

    // defaults to 4-4-2 image
    return 'assets/images/tactics/4-4-2.png';
  }

  viewTacticDetails(tactic: Tactic, event: Event): void {
    // Prevent delete button click from triggering
    event.stopPropagation();
    
    if (!tactic.tacticID) {
      this.error.set('Cannot view tactic: missing ID');
      return;
    }

    this.router.navigate(['/team/tactics', tactic.tacticID]);
  }
}
