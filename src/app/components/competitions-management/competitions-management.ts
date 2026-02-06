import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormTextfield } from '../shared/textfields/form-textfield/form-textfield';
import { CompetitionParentService } from '../../services/competition-parent.service';
import { CompetitionService } from '../../services/competition.service';
import { DeviceService } from '../../services/device.service';
import { IParentOrganization, IParentOrgPayload, parentOrgScopes } from '../../models/competition-parent.model';
import { Competition, CompetitionPayload } from '../../models/competition.model';
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
    MatInputModule,
    MatSidenavModule,
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
  
  // Drawer state
  drawerOpen = signal(false);
  selectedParent = signal<IParentOrganization | null>(null);
  competitions = signal<Competition[]>([]);
  competitionsBusy = signal(false);

  form: FormGroup;
  competitionForm: FormGroup;
  scopeOptions = [...parentOrgScopes];
  isMobile = false;

  constructor(
    private svc: CompetitionParentService,
    private competitionSvc: CompetitionService,
    private deviceSvc: DeviceService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      Name: ['', [Validators.required, Validators.maxLength(100)]],
      Type: [this.scopeOptions[0], Validators.required]
    });

    this.competitionForm = this.fb.group({
      Name: ['', [Validators.required, Validators.maxLength(100)]],
      Tier: [1, [Validators.required, Validators.min(1)]]
    });

    // Subscribe to device changes
    this.deviceSvc.isMobile$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isMobile => {
        this.isMobile = isMobile;
        this.cdr.markForCheck();
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

  openDrawer(org: IParentOrganization): void {
    this.selectedParent.set(org);
    this.drawerOpen.set(true);
    this.loadCompetitions(org.competitionParentID!);
    this.cdr.markForCheck();
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.selectedParent.set(null);
    this.competitions.set([]);
    this.competitionForm.reset({ Tier: 1 });
    this.cdr.markForCheck();
  }

  loadCompetitions(parentId: string): void {
    this.competitionsBusy.set(true);
    this.competitionSvc.getByParent(parentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.competitions.set(data);
          this.competitionsBusy.set(false);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to load competitions', err);
          this.competitionsBusy.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  addCompetition(): void {
    if (!this.competitionForm.valid || !this.selectedParent()?.competitionParentID) return;

    this.competitionsBusy.set(true);

    const payload: CompetitionPayload = {
      Name: this.competitionForm.value.Name,
      CompetitionParentID: this.selectedParent()!.competitionParentID!,
      Tier: this.competitionForm.value.Tier
    };

    this.competitionSvc.create(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.competitionForm.reset({ Tier: 1 });
          this.loadCompetitions(this.selectedParent()!.competitionParentID!);
        },
        error: (err) => {
          console.error('Failed to create competition', err);
          this.competitionsBusy.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  deleteCompetition(competition: Competition): void {
    if (!confirm(`Delete "${competition.name}"?`)) return;
    if (!competition.competitionID) return;

    this.competitionsBusy.set(true);
    this.competitionSvc.delete(competition.competitionID)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadCompetitions(this.selectedParent()!.competitionParentID!);
        },
        error: (err) => {
          console.error('Failed to delete competition', err);
          this.competitionsBusy.set(false);
          this.cdr.markForCheck();
        }
      });
  }
}