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

  it('should render chat window with background and overlay when open', () => {
    component['isChatOpen'].set(true);
    fixture.detectChanges();

    const chatWindow = fixture.nativeElement.querySelector('.chat-window');
    const bgElement = fixture.nativeElement.querySelector('.chat-window__bg');
    const overlayElement = fixture.nativeElement.querySelector('.chat-window__overlay');

    expect(chatWindow).toBeTruthy();
    expect(bgElement).toBeTruthy();
    expect(overlayElement).toBeTruthy();
  });
});
