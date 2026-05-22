/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { TacticsDetail } from './tactics-detail';
import { TacticsService } from '../../../services/tactics.service';
import { TeamsService } from '../../../services/teams.service';
import { Formation, Tactic } from '../../../models/tactic.model';
import { PlayerPosition, PlayerRole } from '../../../models/player-enums.model';

describe('TacticsDetail', () => {
  let component: TacticsDetail;
  let fixture: ComponentFixture<TacticsDetail>;
  let tacticsService: jasmine.SpyObj<TacticsService>;

  const baseTactic: Tactic = {
    tacticID: 'test-tactic-id',
    teamID: 'team-1',
    name: 'Balanced',
    isMain: false,
    formation: Formation.Four_Four_Two
  };

  beforeEach(async () => {
    tacticsService = jasmine.createSpyObj<TacticsService>('TacticsService', [
      'updateTeamTactic'
    ]);

    await TestBed.configureTestingModule({
      imports: [TacticsDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'test-tactic-id'
              }
            }
          }
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj<Router>('Router', ['navigate'])
        },
        {
          provide: TacticsService,
          useValue: tacticsService
        },
        {
          provide: TeamsService,
          useValue: {
            CurrentTeam: undefined,
            currentTeamObservable: of(),
            getTeamSquad: jasmine.createSpy('getTeamSquad').and.returnValue(of([]))
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TacticsDetail);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reload tactic details after a formation change', () => {
    tacticsService.updateTeamTactic.and.returnValue(of({
      ...baseTactic,
      formation: Formation.Four_Three_Three
    }));

    component.tactic.set(baseTactic);
    component.tacticId.set(baseTactic.tacticID!);
    component.editPopupOpen.set(true);
    component.selectedPlayer.set({
      playerName: 'J. Doe',
      position: 'GK',
      positionValue: PlayerPosition.Goalkeeper,
      roleValue: PlayerRole.Goalkeeper,
      suitability: 90,
      bestTrainedPosition: 'GK',
      bestTrainedRole: 'GK',
      playerTacticID: 'player-tactic-1',
      squadUnit: 0,
      substituteOrder: Number.MAX_SAFE_INTEGER
    });
    component.editModel.set({
      name: 'Balanced',
      isMain: false,
      formation: Formation.Four_Three_Three,
      captainID: null,
      penaltyTakerID: null,
      leftCornerTakerID: null,
      rightCornerTakerID: null
    });

    spyOn(component, 'loadTacticDetails');

    component.saveTacticEdit();

    expect(component.loadTacticDetails).toHaveBeenCalledOnceWith(baseTactic.tacticID!);
    expect(component.selectedPlayer()).toBeNull();
    expect(component.editPopupOpen()).toBeFalse();
    expect(component.editSaving()).toBeFalse();
  });

  it('should update tactic locally when the formation is unchanged', () => {
    const updatedTactic: Tactic = {
      ...baseTactic,
      name: 'Control'
    };

    tacticsService.updateTeamTactic.and.returnValue(of(updatedTactic));

    component.tactic.set(baseTactic);
    component.tacticId.set(baseTactic.tacticID!);
    component.editModel.set({
      name: updatedTactic.name,
      isMain: updatedTactic.isMain,
      formation: updatedTactic.formation!,
      captainID: null,
      penaltyTakerID: null,
      leftCornerTakerID: null,
      rightCornerTakerID: null
    });

    spyOn(component, 'loadTacticDetails');

    component.saveTacticEdit();

    expect(component.loadTacticDetails).not.toHaveBeenCalled();
    expect(component.tactic()).toEqual(updatedTactic);
  });
});
