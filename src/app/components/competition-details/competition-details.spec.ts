/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetitionDetails } from './competition-details';

describe('CompetitionDetails', () => {
  let component: CompetitionDetails;
  let fixture: ComponentFixture<CompetitionDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitionDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompetitionDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
