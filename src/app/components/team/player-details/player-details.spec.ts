/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { PlayerDetails } from './player-details';
import { TeamsService } from '../../../services/teams.service';
import { PlayerPosition, PlayerRole } from '../../../models/player-enums.model';

describe('PlayerDetails', () => {
  let component: PlayerDetails;
  let fixture: ComponentFixture<PlayerDetails>;

  beforeEach(async () => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('test-player-id')
        }
      }
    };

    const mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const mockTeamsService = {
      getPlayerDetails: jasmine.createSpy('getPlayerDetails').and.returnValue(of({
        name: 'Test',
        surname: 'Player',
        dateOfBirth: '2000-01-01T00:00:00Z',
        placeOfBirth: 'Athens',
        playerStats: {
          shooting: 70,
          passing: 68,
          crossing: 65,
          tackling: 55,
          dribbling: 72,
          control: 71,
          kicking: 60,
          goalkeeping: 10,
          teamwork: 66,
          creativity: 67,
          decisions: 64,
          positioning: 69,
          speed: 73,
          acceleration: 74,
          strength: 62,
          jumping: 58,
          stamina: 75
        },
        playerTrainedPositions: [
          { playerPosition: PlayerPosition.CentralStriker, playerTrainedPositionAdaptation: 88 }
        ],
        playerTrainedRoles: [
          { playerRole: PlayerRole.AdvancedForward, playerTrainedRoleAdaptation: 85 }
        ],
        contracts: [
          {
            startDate: '2025-07-01T00:00:00Z',
            endDate: '2027-06-30T00:00:00Z',
            team: { name: 'Test FC' }
          }
        ]
      }))
    };

    await TestBed.configureTestingModule({
      imports: [PlayerDetails],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: TeamsService, useValue: mockTeamsService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render shared cards for the player summary and stats sections', () => {
    const cards = fixture.debugElement.queryAll(By.css('app-card'));

    expect(cards.length).toBe(2);
    expect(fixture.nativeElement.querySelector('mat-card')).toBeNull();
  });
});
