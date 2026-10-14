import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousConversations } from './previous-conversations';

describe('PreviousConversations', () => {
  let component: PreviousConversations;
  let fixture: ComponentFixture<PreviousConversations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviousConversations],
    }).compileComponents();

    fixture = TestBed.createComponent(PreviousConversations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have conversations signal from service', () => {
    expect(component.conversations).toBeDefined();
    expect(Array.isArray(component.conversations())).toBe(true);
  });

  it('should emit closed event on new conversation', () => {
    const spy = vi.spyOn(component.closed, 'emit');
    component.onNewConversation();
    expect(spy).toHaveBeenCalled();
  });
});
