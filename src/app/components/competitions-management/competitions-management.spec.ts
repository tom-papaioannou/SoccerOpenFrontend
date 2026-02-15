/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetitionsManagement } from './competitions-management';

describe('CompetitionsManagement', () => {
  let component: CompetitionsManagement;
  let fixture: ComponentFixture<CompetitionsManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitionsManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompetitionsManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
