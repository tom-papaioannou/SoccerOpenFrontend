import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  CreateTrainingScheduleRequest,
  TrainingSchedule,
  TrainingScheduleCoach,
  TrainingScheduleLevel,
  UpdateTrainingScheduleRequest
} from '../../../models/training-schedule.model';
import { TrainingSchedulesService } from '../../../services/training-schedules.service';

type TrainingPointControl =
  | 'AttackPoints'
  | 'DefendPoints'
  | 'ControlPoints'
  | 'GoalkeeperPoints'
  | 'TacticPoints'
  | 'FitnessPoints';

interface TrainingPointField {
  control: TrainingPointControl;
  responseProperty: keyof Pick<
    TrainingSchedule,
    'attackPoints' | 'defendPoints' | 'controlPoints' | 'goalkeeperPoints' | 'tacticPoints' | 'fitnessPoints'
  >;
  label: string;
}

@Component({
  selector: 'app-training',
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule],
  templateUrl: './training.html',
  styleUrl: './training.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Training implements OnInit {
  readonly maximumTotalPoints = 20;
  readonly maximumPointsPerCategory = 5;
  readonly schedules = signal<TrainingSchedule[]>([]);
  readonly selectedSchedule = signal<TrainingSchedule | null>(null);
  readonly coaches = signal<TrainingScheduleCoach[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly savingChanges = signal(false);
  readonly editDirty = signal(false);
  readonly createOpen = signal(false);
  readonly error = signal<string | null>(null);

  readonly levelOptions = [
    { value: TrainingScheduleLevel.Easy, label: 'Easy' },
    { value: TrainingScheduleLevel.Medium, label: 'Medium' },
    { value: TrainingScheduleLevel.Hard, label: 'Hard' }
  ];

  readonly trainingPointFields: TrainingPointField[] = [
    { control: 'AttackPoints', responseProperty: 'attackPoints', label: 'Attack' },
    { control: 'DefendPoints', responseProperty: 'defendPoints', label: 'Defend' },
    { control: 'ControlPoints', responseProperty: 'controlPoints', label: 'Control' },
    { control: 'GoalkeeperPoints', responseProperty: 'goalkeeperPoints', label: 'Goalkeeper' },
    { control: 'TacticPoints', responseProperty: 'tacticPoints', label: 'Tactic' },
    { control: 'FitnessPoints', responseProperty: 'fitnessPoints', label: 'Fitness' }
  ];

  readonly createForm;
  readonly editForm;
  private editInitialValue = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly trainingSchedulesService: TrainingSchedulesService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.createForm = this.formBuilder.nonNullable.group({
      ScheduleName: ['', [Validators.required, Validators.maxLength(100)]],
      TrainingScheduleLevel: [TrainingScheduleLevel.Easy],
      CoachID: ['', Validators.required],
      AttackPoints: [0],
      DefendPoints: [0],
      ControlPoints: [0],
      GoalkeeperPoints: [0],
      TacticPoints: [0],
      FitnessPoints: [0]
    });
    this.editForm = this.formBuilder.nonNullable.group({
      ScheduleName: ['', [Validators.required, Validators.maxLength(100)]],
      TrainingScheduleLevel: [TrainingScheduleLevel.Easy],
      CoachID: ['', Validators.required],
      AttackPoints: [0],
      DefendPoints: [0],
      ControlPoints: [0],
      GoalkeeperPoints: [0],
      TacticPoints: [0],
      FitnessPoints: [0]
    });
    this.editForm.valueChanges.subscribe(value => {
      this.editDirty.set(JSON.stringify(value) !== this.editInitialValue);
    });
  }

  ngOnInit(): void {
    this.loadSchedules();
    this.loadCoaches();
  }

  loadSchedules(preferredScheduleID?: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.trainingSchedulesService.getTeamTrainingSchedules().subscribe({
      next: schedules => {
        this.schedules.set(schedules);
        this.selectedSchedule.set(
          schedules.find(schedule => schedule.trainingScheduleID === preferredScheduleID) ?? schedules[0] ?? null
        );
        this.resetEditForm(this.selectedSchedule());
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: error => {
        this.schedules.set([]);
        this.selectedSchedule.set(null);
        this.error.set(error.message || 'Unable to load training schedules.');
        this.loading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  openCreate(): void {
    this.error.set(null);
    if (this.coaches().length === 0) {
      this.error.set('Your team needs an active coach before a training schedule can be created.');
      return;
    }

    this.createForm.reset(this.getDefaultFormValue());
    this.createOpen.set(true);
    this.cdr.markForCheck();
  }

  cancelCreate(): void {
    if (this.saving()) {
      return;
    }

    this.createOpen.set(false);
    this.createForm.reset(this.getDefaultFormValue());
    this.cdr.markForCheck();
  }

  selectSchedule(schedule: TrainingSchedule): void {
    this.selectedSchedule.set(schedule);
    this.resetEditForm(schedule);
  }

  onSliderChanged(control: TrainingPointControl, event: Event): void {
    const input = event.target as HTMLInputElement;
    const desiredValue = Number(input.value);
    const otherPoints = this.totalSliderPoints() - this.controlValue(control);
    const allowedValue = Math.min(
      this.maximumPointsPerCategory,
      this.maximumTotalPoints - otherPoints
    );

    const acceptedValue = Math.max(0, Math.min(desiredValue, allowedValue));
    input.value = String(acceptedValue);
    this.createForm.controls[control].setValue(acceptedValue);
    this.cdr.markForCheck();
  }

  totalSliderPoints(): number {
    return this.trainingPointFields.reduce((total, field) => total + this.controlValue(field.control), 0);
  }

  availablePoints(): number {
    return this.maximumTotalPoints - this.totalSliderPoints();
  }

  onEditSliderChanged(control: TrainingPointControl, event: Event): void {
    const input = event.target as HTMLInputElement;
    const desiredValue = Number(input.value);
    const otherPoints = this.editTotalSliderPoints() - this.editControlValue(control);
    const acceptedValue = Math.max(
      0,
      Math.min(desiredValue, this.maximumPointsPerCategory, this.maximumTotalPoints - otherPoints)
    );

    input.value = String(acceptedValue);
    this.editForm.controls[control].setValue(acceptedValue);
    this.cdr.markForCheck();
  }

  editTotalSliderPoints(): number {
    return this.trainingPointFields.reduce((total, field) => total + this.editControlValue(field.control), 0);
  }

  editAvailablePoints(): number {
    return this.maximumTotalPoints - this.editTotalSliderPoints();
  }

  sliderValue(points: number): number {
    return Math.max(0, Math.min(this.maximumPointsPerCategory, Math.round(points / 20)));
  }

  levelLabel(level: TrainingScheduleLevel): string {
    return this.levelOptions.find(option => option.value === level)?.label ?? 'Unknown';
  }

  save(): void {
    if (this.createForm.invalid || this.totalSliderPoints() > this.maximumTotalPoints) {
      this.createForm.markAllAsTouched();
      return;
    }

    const formValue = this.createForm.getRawValue();
    const scheduleName = formValue.ScheduleName.trim();
    if (!scheduleName) {
      this.createForm.controls.ScheduleName.setErrors({ required: true });
      return;
    }

    const request: CreateTrainingScheduleRequest = {
      scheduleName,
      trainingScheduleLevel: formValue.TrainingScheduleLevel,
      coachID: formValue.CoachID,
      attackPoints: formValue.AttackPoints,
      defendPoints: formValue.DefendPoints,
      controlPoints: formValue.ControlPoints,
      goalkeeperPoints: formValue.GoalkeeperPoints,
      tacticPoints: formValue.TacticPoints,
      fitnessPoints: formValue.FitnessPoints
    };

    this.saving.set(true);
    this.error.set(null);
    this.trainingSchedulesService.createTrainingSchedule(request).subscribe({
      next: schedule => {
        this.saving.set(false);
        this.createOpen.set(false);
        this.createForm.reset(this.getDefaultFormValue());
        this.loadSchedules(schedule.trainingScheduleID);
      },
      error: error => {
        this.error.set(error.message || 'Unable to create the training schedule.');
        this.saving.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  saveChanges(): void {
    const schedule = this.selectedSchedule();
    if (!schedule || this.editForm.invalid || this.editTotalSliderPoints() > this.maximumTotalPoints) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formValue = this.editForm.getRawValue();
    const scheduleName = formValue.ScheduleName.trim();
    if (!scheduleName) {
      this.editForm.controls.ScheduleName.setErrors({ required: true });
      return;
    }

    const request: UpdateTrainingScheduleRequest = {
      scheduleName,
      trainingScheduleLevel: formValue.TrainingScheduleLevel,
      coachID: formValue.CoachID,
      attackPoints: formValue.AttackPoints,
      defendPoints: formValue.DefendPoints,
      controlPoints: formValue.ControlPoints,
      goalkeeperPoints: formValue.GoalkeeperPoints,
      tacticPoints: formValue.TacticPoints,
      fitnessPoints: formValue.FitnessPoints
    };

    this.savingChanges.set(true);
    this.error.set(null);
    this.trainingSchedulesService.updateTrainingSchedule(schedule.trainingScheduleID, request).subscribe({
      next: updatedSchedule => {
        this.schedules.update(schedules => schedules.map(item =>
          item.trainingScheduleID === updatedSchedule.trainingScheduleID ? updatedSchedule : item
        ));
        this.selectedSchedule.set(updatedSchedule);
        this.resetEditForm(updatedSchedule);
        this.savingChanges.set(false);
        this.cdr.markForCheck();
      },
      error: error => {
        this.error.set(error.message || 'Unable to save the training schedule.');
        this.savingChanges.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  private controlValue(control: TrainingPointControl): number {
    return this.createForm.controls[control].value;
  }

  private editControlValue(control: TrainingPointControl): number {
    return this.editForm.controls[control].value;
  }

  private getDefaultFormValue() {
    return {
      ScheduleName: 'New Training Schedule',
      TrainingScheduleLevel: TrainingScheduleLevel.Easy,
      CoachID: this.coaches()[0]?.personID ?? '',
      AttackPoints: 0,
      DefendPoints: 0,
      ControlPoints: 0,
      GoalkeeperPoints: 0,
      TacticPoints: 0,
      FitnessPoints: 0
    };
  }

  private loadCoaches(): void {
    this.trainingSchedulesService.getTeamCoaches().subscribe({
      next: coaches => {
        this.coaches.set(coaches);
        this.cdr.markForCheck();
      },
      error: error => {
        this.error.set(error.message || 'Unable to load team coaches.');
        this.cdr.markForCheck();
      }
    });
  }

  private resetEditForm(schedule: TrainingSchedule | null): void {
    if (!schedule) {
      this.editInitialValue = '';
      this.editForm.reset(this.getDefaultFormValue(), { emitEvent: false });
      this.editDirty.set(false);
      return;
    }

    const value = {
      ScheduleName: schedule.scheduleName,
      TrainingScheduleLevel: schedule.trainingScheduleLevel,
      CoachID: schedule.coachID ?? '',
      AttackPoints: this.sliderValue(schedule.attackPoints),
      DefendPoints: this.sliderValue(schedule.defendPoints),
      ControlPoints: this.sliderValue(schedule.controlPoints),
      GoalkeeperPoints: this.sliderValue(schedule.goalkeeperPoints),
      TacticPoints: this.sliderValue(schedule.tacticPoints),
      FitnessPoints: this.sliderValue(schedule.fitnessPoints)
    };
    this.editInitialValue = JSON.stringify(value);
    this.editForm.reset(value, { emitEvent: false });
    this.editDirty.set(false);
  }
}
