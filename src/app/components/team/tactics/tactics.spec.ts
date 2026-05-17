/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

import { Tactics } from './tactics';
import { Tactic, Formation } from '../../../models/tactic.model';
import { TeamsService } from '../../../services/teams.service';
import { Team } from '../../../models/competition.model';
import { Card } from '../../shared/cards/card/card';

describe('Tactics', () => {
  let component: Tactics;
  let fixture: ComponentFixture<Tactics>;
  let teamsService: TeamsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tactics],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tactics);
    component = fixture.componentInstance;
    teamsService = TestBed.inject(TeamsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Delete button visibility', () => {
    it('should not show delete button when there is only one tactic', () => {
      // Arrange: Set up component with one tactic
      const singleTactic: Tactic = {
        tacticID: '1',
        teamID: 'test-team',
        name: 'Test Tactic',
        isMain: true,
        formation: Formation.Four_Four_Two
      };
      component.tactics.set([singleTactic]);
      
      // Act: Trigger change detection
      fixture.detectChanges();
      
      // Assert: Delete button should not be present
      const deleteButtons = fixture.debugElement.queryAll(By.css('.delete-button'));
      expect(deleteButtons.length).toBe(0);
    });

    it('should show delete buttons when there are multiple tactics', () => {
      // Arrange: Set up component with multiple tactics
      const tactics: Tactic[] = [
        {
          tacticID: '1',
          teamID: 'test-team',
          name: 'Tactic 1',
          isMain: true,
          formation: Formation.Four_Four_Two
        },
        {
          tacticID: '2',
          teamID: 'test-team',
          name: 'Tactic 2',
          isMain: false,
          formation: Formation.Four_Three_Three
        }
      ];
      component.tactics.set(tactics);
      
      // Act: Trigger change detection
      fixture.detectChanges();
      
      // Assert: Delete buttons should be present (one for each tactic)
      const deleteButtons = fixture.debugElement.queryAll(By.css('.delete-button'));
      expect(deleteButtons.length).toBe(2);
    });

    it('should show delete buttons when there are three tactics', () => {
      // Arrange: Set up component with maximum tactics
      const tactics: Tactic[] = [
        {
          tacticID: '1',
          teamID: 'test-team',
          name: 'Tactic 1',
          isMain: true,
          formation: Formation.Four_Four_Two
        },
        {
          tacticID: '2',
          teamID: 'test-team',
          name: 'Tactic 2',
          isMain: false,
          formation: Formation.Four_Three_Three
        },
        {
          tacticID: '3',
          teamID: 'test-team',
          name: 'Tactic 3',
          isMain: false,
          formation: Formation.Three_Five_Two
        }
      ];
      component.tactics.set(tactics);
      
      // Act: Trigger change detection
      fixture.detectChanges();
      
      // Assert: Delete buttons should be present (one for each tactic)
      const deleteButtons = fixture.debugElement.queryAll(By.css('.delete-button'));
      expect(deleteButtons.length).toBe(3);
    });
  });

  describe('shared card usage', () => {
    it('should use hoverable shared cards for tactic tiles and the add card', () => {
      const tactics: Tactic[] = [
        {
          tacticID: '1',
          teamID: 'test-team',
          name: 'Tactic 1',
          isMain: true,
          formation: Formation.Four_Four_Two
        }
      ];

      component.tactics.set(tactics);
      component.loading.set(false);
      component.createMode.set(false);
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(Card))
        .map((debugElement) => debugElement.componentInstance as Card);

      expect(cards.length).toBe(2);
      expect(cards.every((card) => card.hoverable)).toBeTrue();
    });

    it('should show the create popup without adding an inline shared card', () => {
      component.tactics.set([
        {
          tacticID: '1',
          teamID: 'test-team',
          name: 'Tactic 1',
          isMain: true,
          formation: Formation.Four_Four_Two
        }
      ]);
      component.createMode.set(true);
      component.loading.set(false);
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(Card))
        .map((debugElement) => debugElement.componentInstance as Card);
      const popup = fixture.debugElement.query(By.css('.tactic-create-popup'));

      expect(cards.length).toBe(2);
      expect(cards.every((card) => card.hoverable)).toBeTrue();
      expect(popup).toBeTruthy();
    });
  });

  describe('ngOnInit behavior with CurrentTeam', () => {
    it('should call loadTactics when CurrentTeam is set', () => {
      // Arrange: Create a new component without triggering initial detectChanges
      const newFixture = TestBed.createComponent(Tactics);
      const newComponent = newFixture.componentInstance;
      
      // Spy on loadTactics before initialization
      spyOn(newComponent, 'loadTactics');
      
      // Create a mock team
      const mockTeam: Team = {
        teamID: 'test-team-123',
        name: 'Test Team'
      } as Team;

      // Act: Set the team which should trigger the observable
      teamsService.CurrentTeam = mockTeam;
      
      // Trigger ngOnInit by calling detectChanges
      newFixture.detectChanges();

      // Assert: loadTactics should have been called
      expect(newComponent.loadTactics).toHaveBeenCalled();
    });
  });
});
