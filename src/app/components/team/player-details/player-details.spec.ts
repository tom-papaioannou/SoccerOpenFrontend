import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { PlayerDetails } from './player-details';
import { TeamsService } from '../../../services/teams.service';

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
        person: { name: 'Test', surname: 'Player', contracts: [] },
        playerStats: {},
        playerTrainedPositions: [],
        playerTrainedRoles: []
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
});
