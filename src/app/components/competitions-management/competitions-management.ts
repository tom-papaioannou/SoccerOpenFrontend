/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormTextfield } from '../shared/textfields/form-textfield/form-textfield';
import { FormDropdown } from '../shared/dropdowns/form-dropdown/form-dropdown';
import { ContinentService } from '../../services/continent.service';
import { CompetitionService } from '../../services/competition.service';
import { DeviceService } from '../../services/device.service';
import { IContinent } from '../../models/continent.model';
import { INation } from '../../models/nation.model';
import { Competition, CompetitionPayload, CompetitionTeamsType, CompetitionType } from '../../models/competition.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-competitions-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatCardContent,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    FormTextfield,
    FormDropdown
  ],
  templateUrl: './competitions-management.html',
  styleUrl: './competitions-management.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompetitionsManagement implements OnInit {
  private destroyRef = inject(DestroyRef);
  
  continents = signal<IContinent[]>([]);
  nationsByContinent = signal<Record<string, INation[]>>({});
  busy = signal(false);
  errorMsg = signal<string | null>(null);
  
  // Drawer state
  drawerOpen = signal(false);
  selectedName = signal<string | null>(null);
  selectedType = signal<'continent' | 'nation' | null>(null);
  selectedId = signal<string | null>(null);
  competitions = signal<Competition[]>([]);
  competitionsBusy = signal(false);

  competitionForm: FormGroup;
  isMobile = false;

  // Enum options for dropdowns
  competitionTeamsTypes = [
    { value: CompetitionTeamsType.Clubs, label: 'Clubs' },
    { value: CompetitionTeamsType.NationalTeams, label: 'National Teams' }
  ];

  priorityLeagueTypes = [
    { value: 1, label: 'First' },
    { value: 2, label: 'Second' },
    { value: 3, label: 'Third' },
    { value: 4, label: 'Fourth' }
  ];

  priorityCupTypes = [
    { value: 1, label: 'Important' },
    { value: 2, label: 'Less Important' },
    { value: 3, label: 'Unimportant' },
    { value: 4, label: 'Friendly' }
  ];

  competitionTypes = [
    { value: CompetitionType.League, label: 'League' },
    { value: CompetitionType.Cup, label: 'Cup' },
    { value: CompetitionType.Continental, label: 'Continental' }
  ];

  // Expose enum to template for conditional rendering
  CompetitionType = CompetitionType;

  constructor(
    private continentSvc: ContinentService,
    private competitionSvc: CompetitionService,
    private deviceSvc: DeviceService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService
  ) {
    this.competitionForm = this.fb.group({
      CompetitionName: ['', [Validators.required, Validators.maxLength(100)]],
      Priority: [1, [Validators.required, Validators.min(1)]],
      CompetitionTeamsType: [CompetitionTeamsType.Clubs, Validators.required],
      CompetitionType: [CompetitionType.League, Validators.required]
    });

    // Subscribe to device changes
    this.deviceSvc.isMobile$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isMobile => {
        this.isMobile = isMobile;
        this.cdr.markForCheck();
      });
  }

  // Getter to check current competition type
  get selectedCompetitionType(): CompetitionType {
    return this.competitionForm.get('CompetitionType')?.value;
  }

  // Getter to return appropriate priority options based on competition type
  get priorityOptions() {
    const type = this.selectedCompetitionType;
    if (type === CompetitionType.League) {
      return this.priorityLeagueTypes;
    } else {
      return this.priorityCupTypes;
    }
  }

  // Getter to return appropriate label for priority field
  get priorityLabel(): string {
    const type = this.selectedCompetitionType;
    return type === CompetitionType.League ? 'Division' : 'Importance';
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.busy.set(true);
    this.errorMsg.set(null);

    this.continentSvc.loadAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.continents.set(data);
          // Extract nations from the continent response
          const nationsMap: Record<string, INation[]> = {};
          for (const continent of data) {
            nationsMap[continent.continentID] = continent.nations || [];
          }
          this.nationsByContinent.set(nationsMap);
          this.busy.set(false);
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.errorMsg.set(err.message || 'Failed to load continents');
          this.busy.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  openDrawerForContinent(continent: IContinent): void {
    this.selectedName.set(continent.name);
    this.selectedType.set('continent');
    this.selectedId.set(continent.continentID);
    this.drawerOpen.set(true);
    this.loadCompetitions(continent.continentID);
    this.cdr.markForCheck();
  }

  openDrawerForNation(nation: INation): void {
    this.selectedName.set(nation.name);
    this.selectedType.set('nation');
    this.selectedId.set(nation.nationID);
    this.drawerOpen.set(true);
    this.loadCompetitions(nation.nationID);
    this.cdr.markForCheck();
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.selectedName.set(null);
    this.selectedType.set(null);
    this.selectedId.set(null);
    this.competitions.set([]);
    this.competitionForm.reset({ 
      Priority: 1,
      CompetitionTeamsType: CompetitionTeamsType.Clubs,
      CompetitionType: CompetitionType.League
    });
    this.cdr.markForCheck();
  }

  loadCompetitions(competitionParentID: string): void {
    this.competitionsBusy.set(true);
    this.competitionSvc.getAllCompetitions(competitionParentID)
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
    if (!this.competitionForm.valid || !this.selectedId()) return;

    this.competitionsBusy.set(true);

    const payload: CompetitionPayload = {
      CompetitionName: this.competitionForm.value.CompetitionName,
      Priority: this.competitionForm.value.Priority,
      CompetitionTeamsType: this.competitionForm.value.CompetitionTeamsType,
      CompetitionType: this.competitionForm.value.CompetitionType,
      ServerID: this.authService.currentServerID
    };

    if (this.selectedType() === 'nation') {
      payload.NationID = this.selectedId()!;
    } else if (this.selectedType() === 'continent') {
      payload.ContinentID = this.selectedId()!;
    }

    this.competitionSvc.create(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.competitionForm.reset({ 
            Priority: 1,
            CompetitionTeamsType: CompetitionTeamsType.Clubs,
            CompetitionType: CompetitionType.League
          });
          if (this.selectedType() === 'nation') {
            this.loadCompetitions(this.selectedId()!);
          } else if (this.selectedType() === 'continent') {
            this.loadCompetitions(this.selectedId()!);
          }
        },
        error: (err) => {
          console.error('Failed to create competition', err);
          this.competitionsBusy.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  viewCompetitionDetails(competition: Competition): void {
    if (competition.competitionID) {
      this.router.navigate(['/competition', competition.competitionID]);
    }
  }

  deleteCompetition(competition: Competition): void {
    if (!confirm(`Delete "${competition.competitionName}"?`)) return;
    if (!competition.competitionID) return;

    this.competitionsBusy.set(true);
    this.competitionSvc.delete(competition.competitionID)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.selectedType() === 'nation') {
            this.loadCompetitions(this.selectedId()!);
          } else if (this.selectedType() === 'continent') {
            this.loadCompetitions(this.selectedId()!);
          }
        },
        error: (err) => {
          console.error('Failed to delete competition', err);
          this.competitionsBusy.set(false);
          this.cdr.markForCheck();
        }
      });
  }
}