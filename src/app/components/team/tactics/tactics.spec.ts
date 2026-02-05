import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Tactics } from './tactics';

describe('Tactics', () => {
  let component: Tactics;
  let fixture: ComponentFixture<Tactics>;

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
