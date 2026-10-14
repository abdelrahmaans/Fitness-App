import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenderSelection } from './gender-selection';

describe('GenderSelection', () => {
  let component: GenderSelection;
  let fixture: ComponentFixture<GenderSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenderSelection],
    }).compileComponents();

    fixture = TestBed.createComponent(GenderSelection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
