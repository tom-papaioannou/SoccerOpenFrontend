/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Card } from './card';

@Component({
  template: '<app-card appearance="filled"><span class="projected-content">Shared card</span></app-card>',
  imports: [Card]
})
class TestHostComponent {}

describe('Card', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should project content inside the material card', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('mat-card .projected-content')?.textContent).toContain('Shared card');
  });

  it('should pass the configured appearance to the shared card component', () => {
    const cardComponent = fixture.debugElement.query(By.directive(Card)).componentInstance as Card;

    expect(cardComponent.appearance).toBe('filled');
  });
});
