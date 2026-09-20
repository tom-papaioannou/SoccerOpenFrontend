export enum TrainingScheduleLevel {
  Easy = 0,
  Medium = 1,
  Hard = 2
}

export interface TrainingSchedule {
  trainingScheduleID: string;
  scheduleName: string;
  trainingScheduleLevel: TrainingScheduleLevel;
  attackPoints: number;
  defendPoints: number;
  controlPoints: number;
  goalkeeperPoints: number;
  tacticPoints: number;
  fitnessPoints: number;
  coachID: string | null;
}

export interface CreateTrainingScheduleRequest {
  scheduleName: string;
  trainingScheduleLevel: TrainingScheduleLevel;
  coachID: string;
  attackPoints: number;
  defendPoints: number;
  controlPoints: number;
  goalkeeperPoints: number;
  tacticPoints: number;
  fitnessPoints: number;
}

export type UpdateTrainingScheduleRequest = CreateTrainingScheduleRequest;

export interface TrainingScheduleCoach {
  personID: string;
  name: string;
}
