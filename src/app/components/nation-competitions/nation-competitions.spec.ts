import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { NationCompetitions } from './nation-competitions';
import { NationService } from '../../services/nation.service';

describe('NationCompetitions', () => {
  let fixture: ComponentFixture<NationCompetitions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NationCompetitions],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'nation-id' } } } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        {
          provide: NationService,
          useValue: {
            getDetails: () => of({
              nationID: 'nation-id', name: 'Greece', iso2: 'GR', flagUrl: null, continentID: 'continent-id',
              competitions: [{ competitionID: 'competition-id', competitionName: 'League', priority: 1, competitionType: 1, competitionTeamsType: 2, teamsCount: 16 }],
              squad: [{ personID: 'player-id', name: 'Test', surname: 'Player', playerTrainedPositions: [], playerTrainedRoles: [] }]
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NationCompetitions);
    fixture.detectChanges();
  });

  it('contains Squad and Competitions tabs and preserves competition data when switching', () => {
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('.nation-tabs button')) as HTMLButtonElement[];

    expect(buttons.map(button => button.textContent?.trim())).toEqual(['Squad', 'Competitions']);
    buttons[1].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('League');
  });
});
