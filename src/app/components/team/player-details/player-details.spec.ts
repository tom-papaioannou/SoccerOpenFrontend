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
import { NationService } from '../../../services/nation.service';
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
        nationID: 'greece-id',
        weight: 78,
        height: 184,
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
          speed: 82,
          acceleration: 74,
          strength: 62,
          jumping: 58,
          stamina: 75
        },
        playerTrainedPositions: [
          { playerPosition: PlayerPosition.CentralStriker, playerTrainedPositionAdaptation: 88 },
          { playerPosition: PlayerPosition.LeftCenterMidfielder, playerTrainedPositionAdaptation: 81 },
          { playerPosition: PlayerPosition.CentralCenterMidfielder, playerTrainedPositionAdaptation: 80 },
          { playerPosition: PlayerPosition.RightCenterMidfielder, playerTrainedPositionAdaptation: 79 },
          { playerPosition: PlayerPosition.LeftWinger, playerTrainedPositionAdaptation: 71 }
        ],
        playerTrainedRoles: [
          {
            playerPosition: PlayerPosition.CentralStriker,
            playerRole: PlayerRole.AdvancedForward,
            playerTrainedRoleAdaptation: 85
          },
          {
            playerPosition: PlayerPosition.LeftCenterMidfielder,
            playerRole: PlayerRole.BoxToBoxMidfielder,
            playerTrainedRoleAdaptation: 84
          },
          {
            playerPosition: PlayerPosition.CentralCenterMidfielder,
            playerRole: PlayerRole.CentralMidfielder,
            playerTrainedRoleAdaptation: 82
          },
          {
            playerPosition: PlayerPosition.RightCenterMidfielder,
            playerRole: PlayerRole.AdvancedPlaymaker,
            playerTrainedRoleAdaptation: 80
          },
          {
            playerPosition: PlayerPosition.LeftWinger,
            playerRole: PlayerRole.Winger,
            playerTrainedRoleAdaptation: 78
          }
        ],
        contracts: [
          {
            startDate: '2025-07-01T00:00:00Z',
            endDate: '2027-06-30T00:00:00Z',
            wage: 3200,
            team: { name: 'Test FC' }
          }
        ]
      }))
    };
    const mockNationService = {
      getAll: jasmine.createSpy('getAll').and.returnValue(of([
        {
          nationID: 'greece-id',
          name: 'Greece',
          iso2: 'GR',
          flagUrl: null,
          continentID: 'europe-id'
        }
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [PlayerDetails],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: TeamsService, useValue: mockTeamsService },
        { provide: NationService, useValue: mockNationService }
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

  it('should render separate app-card containers for personal, history, stats, and positions sections', () => {
    const cards = fixture.debugElement.queryAll(By.css('app-card'));

    expect(cards.length).toBe(4);
    expect(fixture.nativeElement.querySelector('mat-card')).toBeNull();
  });

  it('should render stat labels and values without progress bars', () => {
    const element = fixture.nativeElement as HTMLElement;
    const statsCardText = fixture.debugElement.queryAll(By.css('app-card'))[2].nativeElement.textContent;
    const statsCardHeading = fixture.debugElement.queryAll(By.css('app-card'))[2].query(By.css('h2'));

    expect(statsCardHeading).toBeNull();
    expect(statsCardText).toContain('Shooting');
    expect(statsCardText).toContain('Tackling');
    expect(statsCardText).toContain('Goalkeeping');
    expect(statsCardText).toContain('70');
    expect(element.querySelector('.bg-gray-700')).toBeNull();
    expect(element.querySelector('.bg-gradient-to-r')).toBeNull();
  });

  it('should group tackling and goalkeeping under the technical stats column', () => {
    const statsCard = fixture.debugElement.queryAll(By.css('app-card'))[2];
    const categorySections = statsCard.queryAll(By.css('h3'));
    const technicalSection = categorySections.find(
      (section) => section.nativeElement.textContent.trim() === 'Technical'
    )?.nativeElement as HTMLElement | undefined;
    const categoryTitles = categorySections.map((section) => section.nativeElement.textContent.trim());

    expect(technicalSection?.parentElement?.textContent).toContain('Tackling');
    expect(technicalSection?.parentElement?.textContent).toContain('Goalkeeping');
    expect(technicalSection?.parentElement?.textContent).toContain('55');
    expect(technicalSection?.parentElement?.textContent).toContain('10');
    expect(categoryTitles).not.toContain('Defensive');
    expect(categoryTitles).not.toContain('Goalkeeping');
  });

  it('should left align stat category titles and render styled stat rows within the stat columns', () => {
    const statsCard = fixture.debugElement.queryAll(By.css('app-card'))[2];
    const categorySections = statsCard.queryAll(By.css('h3'));
    const statsColumns = statsCard.queryAll(By.css('.stats-category'));
    const statsGrid = statsCard.query(By.css('.stats-grid'));
    const statRows = statsCard.queryAll(By.css('.stats-row'));

    expect(statsGrid).not.toBeNull();
    expect(statsColumns.length).toBe(categorySections.length);
    expect(statRows.length).toBeGreaterThan(0);
    expect(categorySections.every((section) => section.nativeElement.classList.contains('text-left'))).toBeTrue();
    expect(categorySections.every((section) => section.nativeElement.classList.contains('text-white'))).toBeTrue();
    expect(categorySections.every((section) => section.nativeElement.classList.contains('stats-category-title'))).toBeTrue();
  });

  it('should add a hover class only to the hovered stat row', () => {
    const statRows = fixture.debugElement.queryAll(By.css('.stats-row'));
    const firstRow = statRows[0];
    const secondRow = statRows[1];

    firstRow.triggerEventHandler('mouseenter');
    fixture.detectChanges();

    expect(firstRow.nativeElement.classList.contains('stats-row-hovered')).toBeTrue();
    expect(secondRow.nativeElement.classList.contains('stats-row-hovered')).toBeFalse();

    firstRow.triggerEventHandler('mouseleave');
    fixture.detectChanges();

    expect(firstRow.nativeElement.classList.contains('stats-row-hovered')).toBeFalse();
  });

  it('should render personal details separately from the history card', () => {
    const element = fixture.nativeElement as HTMLElement;
    const summaryCard = fixture.debugElement.queryAll(By.css('app-card'))[0];
    const historyCard = fixture.debugElement.queryAll(By.css('app-card'))[1];
    const playerOverviewGrid = fixture.debugElement.query(By.css('.player-overview-grid'));
    const summaryTitles = summaryCard.queryAll(By.css('h3'));
    const personalTitle = summaryTitles[0].nativeElement as HTMLElement;
    const historyTitle = historyCard.query(By.css('h3')).nativeElement as HTMLElement;

    expect(personalTitle.textContent?.trim()).toBe('Personal');
    expect(personalTitle.classList.contains('stats-category-title')).toBeTrue();
    expect(summaryTitles.length).toBe(1);
    expect(historyTitle.textContent?.trim()).toBe('History');
    expect(historyTitle.classList.contains('stats-category-title')).toBeTrue();
    expect(historyCard.query(By.css('app-data-table'))).not.toBeNull();
    expect(playerOverviewGrid.query(By.css('.personal-card'))).toBe(summaryCard);
    expect(playerOverviewGrid.query(By.css('.history-card'))).toBe(historyCard);
    expect(summaryCard.query(By.css('.player-portrait-placeholder'))).not.toBeNull();
    expect(summaryCard.query(By.css('.player-team-name')).nativeElement.textContent.trim()).toBe('Test FC');
    expect(summaryCard.query(By.css('.player-team-name')).nativeElement.tagName).toBe('STRONG');
    expect(summaryCard.query(By.css('.nationality-line')).nativeElement.textContent).toContain('Greece');
    expect(summaryCard.query(By.css('.nationality-flag')).nativeElement.getAttribute('src'))
      .toBe('https://flagcdn.com/w40/gr.png');
    expect(summaryCard.nativeElement.textContent).toContain('01/01/2000');
    expect(summaryCard.nativeElement.textContent).toContain(`${component.age} years old`);
    expect(summaryCard.nativeElement.textContent).not.toContain(`(${component.age})`);
    expect(summaryCard.nativeElement.textContent).toContain('Test FC');
    expect(summaryCard.nativeElement.textContent).toContain('until 30/06/2027');
    expect(summaryCard.nativeElement.textContent).toContain('184 cm');
    expect(summaryCard.nativeElement.textContent).toContain('78 kg');
    expect(summaryCard.nativeElement.textContent).toContain('3200 € per week');
    expect(summaryCard.nativeElement.textContent).not.toContain('Test Player (Central Striker)');
    expect(Array.from(element.querySelectorAll('app-card span'))
      .some((span) => span.textContent?.trim() === 'Central Striker')).toBeFalse();
  });

  it('should group central triplets in the page title', () => {
    const pageTitle = fixture.debugElement.query(By.css('h1')).nativeElement as HTMLElement;

    expect(pageTitle.textContent?.replace(/\s+/g, ' ').trim())
      .toBe('Test Player (ST, CM, LW)');
  });

  it('should draw central triplets as one generic pitch node', () => {
    const positionsCard = fixture.debugElement.queryAll(By.css('app-card'))[3];
    const positionNodes = positionsCard.queryAll(By.css('.trained-position-node'));
    const positionLabels = positionNodes.map(node => node.nativeElement.textContent.trim());
    const strikerNode = positionNodes.find(node => node.nativeElement.textContent.trim() === 'ST');
    const midfieldNode = positionNodes.find(node => node.nativeElement.textContent.trim() === 'CM');
    const leftWingNode = positionNodes.find(node => node.nativeElement.textContent.trim() === 'LW');

    expect(positionsCard.nativeElement.textContent).toContain('Positions');
    expect(positionsCard.query(By.css('.trained-position-pitch'))).not.toBeNull();
    expect(positionLabels).toEqual(['ST', 'CM', 'LW']);
    expect(strikerNode?.nativeElement.style.left).toBe('50%');
    expect(midfieldNode?.nativeElement.style.left).toBe('50%');
    expect(leftWingNode?.nativeElement.style.left).toBe('20%');
    expect(leftWingNode?.nativeElement.style.top).not.toBe(strikerNode?.nativeElement.style.top);
  });

  it('should show hoverable trained roles for the selected pitch position', () => {
    const positionsCard = fixture.debugElement.queryAll(By.css('app-card'))[3];
    const positionNodes = positionsCard.queryAll(By.css('.trained-position-node'));
    const strikerNode = positionNodes.find(node => node.nativeElement.textContent.trim() === 'ST');
    const midfieldNode = positionNodes.find(node => node.nativeElement.textContent.trim() === 'CM');
    const leftWingNode = positionNodes.find(node => node.nativeElement.textContent.trim() === 'LW');

    let roleRows = positionsCard.queryAll(By.css('.trained-position-role-row'));
    const rolesHeading = positionsCard.queryAll(By.css('.stats-category-title'))
      .find(title => title.nativeElement.textContent.trim() === 'Roles');

    expect(rolesHeading).toBeDefined();
    expect(strikerNode?.nativeElement.classList.contains('trained-position-node-selected')).toBeTrue();
    expect(roleRows.length).toBe(1);
    expect(roleRows[0].nativeElement.textContent).toContain('AF');
    expect(roleRows[0].nativeElement.textContent).toContain('85');
    expect(positionsCard.nativeElement.textContent).not.toContain('78');

    roleRows[0].triggerEventHandler('mouseenter');
    fixture.detectChanges();

    expect(roleRows[0].nativeElement.classList.contains('stats-row-hovered')).toBeTrue();

    midfieldNode?.triggerEventHandler('click');
    fixture.detectChanges();

    roleRows = positionsCard.queryAll(By.css('.trained-position-role-row'));
    expect(midfieldNode?.nativeElement.classList.contains('trained-position-node-selected')).toBeTrue();
    expect(roleRows.length).toBe(3);
    expect(positionsCard.nativeElement.textContent).toContain('BTBM');
    expect(positionsCard.nativeElement.textContent).toContain('CM');
    expect(positionsCard.nativeElement.textContent).toContain('AP');

    leftWingNode?.triggerEventHandler('click');
    fixture.detectChanges();

    roleRows = positionsCard.queryAll(By.css('.trained-position-role-row'));
    expect(leftWingNode?.nativeElement.classList.contains('trained-position-node-selected')).toBeTrue();
    expect(roleRows.length).toBe(1);
    expect(roleRows[0].nativeElement.textContent).toContain('W');
    expect(roleRows[0].nativeElement.textContent).toContain('78');
    expect(positionsCard.nativeElement.textContent).not.toContain('85');
  });

  it('should color stat values based on their threshold range', () => {
    const statValues = Array.from(
      fixture.nativeElement.querySelectorAll('span.text-sm.font-semibold')
    ) as HTMLElement[];

    const lowValue = statValues.find((element) => element.textContent?.trim() === '10');
    const mediumValue = statValues.find((element) => element.textContent?.trim() === '70');
    const highValue = statValues.find((element) => element.textContent?.trim() === '82');

    expect(lowValue?.classList.contains('text-red-400')).toBeTrue();
    expect(mediumValue?.classList.contains('text-yellow-400')).toBeTrue();
    expect(highValue?.classList.contains('text-green-400')).toBeTrue();
  });
});
