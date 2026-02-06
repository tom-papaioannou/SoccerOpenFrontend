import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDropdown } from './form-dropdown';

describe('FormDropdown', () => {
  let component: FormDropdown;
  let fixture: ComponentFixture<FormDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
