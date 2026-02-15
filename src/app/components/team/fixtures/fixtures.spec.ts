/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fixtures } from './fixtures';

describe('Fixtures', () => {
  let component: Fixtures;
  let fixture: ComponentFixture<Fixtures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fixtures]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fixtures);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
