import { TestBed } from '@angular/core/testing';
import { AuthAside } from './auth-aside';

describe('AuthAside', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthAside],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AuthAside);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
