import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatBot } from './chat-bot';

describe('ChatBot', () => {
  let component: ChatBot;
  let fixture: ComponentFixture<ChatBot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatBot],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatBot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with chat closed', () => {
    expect(component['isChatOpen']()).toBe(false);
  });

  it('should start with drawer closed', () => {
    expect(component['isDrawerOpen']()).toBe(false);
  });
});
