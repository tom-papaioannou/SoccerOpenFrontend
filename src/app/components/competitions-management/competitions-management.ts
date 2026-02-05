import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormTextfield } from '../shared/textfields/form-textfield/form-textfield';
import { CompetitionParentService } from '../../services/competition-parent.service';
import { IParentOrganization, IParentOrgPayload, parentOrgScopes } from '../../models/competition-parent.model';
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
    MatFormFieldModule,
    FormTextfield
  ],
  templateUrl: './competitions-management.html',
  styleUrl: './competitions-management.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompetitionsManagement implements OnInit {
  private destroyRef = inject(DestroyRef);
  
  orgs = signal<IParentOrganization[]>([]);
  busy = signal(false);
  errorMsg = signal<string | null>(null);
  isCreating = signal(false);

  form: FormGroup;
  scopeOptions = [...parentOrgScopes];

  constructor(
    private svc: CompetitionParentService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      Name: ['', [Validators.required, Validators.maxLength(100)]],
      Type: [this.scopeOptions[0], Validators.required]
    });
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.busy.set(true);
    this.errorMsg.set(null);

    this.svc.loadAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.orgs.set(data);
          this.busy.set(false);
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.errorMsg.set(err.message || 'Failed to load organizations');
          this.busy.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  startCreate(): void {
    this.isCreating.set(true);
    this.form.reset({ Type: this.scopeOptions[0] });
    this.cdr.markForCheck();
  }

  submitForm(): void {
    if (!this.form.valid) return;

    this.busy.set(true);
    this.errorMsg.set(null);

    const payload: IParentOrgPayload = this.form.value;

    this.svc.save(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isCreating.set(false);
          this.form.reset({ Type: this.scopeOptions[0] });
          this.refresh();
        },
        error: (err) => {
          this.errorMsg.set(err.message || 'Failed to create organization');
          this.busy.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  cancelForm(): void {
    this.isCreating.set(false);
    this.form.reset({ Type: this.scopeOptions[0] });
    this.cdr.markForCheck();
  }

  removeOrg(org: IParentOrganization, evt: Event): void {
    evt.stopPropagation();
    
    if (!confirm(`Delete "${org.name}"?`)) return;
    if (!org.competitionParentID) {
      this.errorMsg.set('Cannot delete: missing ID');
      return;
    }

    this.busy.set(true);
    this.errorMsg.set(null);
    
    this.svc.destroy(org.competitionParentID)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.refresh();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.errorMsg.set(err.message || 'Failed to delete organization');
          this.busy.set(false);
          this.cdr.markForCheck();
        }
      });
  }
}