import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamKit } from './team-kit';

describe('TeamKit', () => {
  let component: TeamKit;
  let fixture: ComponentFixture<TeamKit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamKit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamKit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
