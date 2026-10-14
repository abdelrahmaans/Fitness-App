import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';

import { ChatBubble } from './chat-bubble';
import type { ChatMessage } from '../../chat-bot.model';

describe('ChatBubble', () => {
  let component: ChatBubble;
  let fixture: ComponentFixture<ChatBubble>;

  const mockBotMessage: ChatMessage = {
    sender: 'bot',
    text: 'Hello! How can I help you today?',
    timestamp: new Date(),
  };

  const mockUserMessage: ChatMessage = {
    sender: 'user',
    text: 'Give me a workout plan',
    timestamp: new Date(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatBubble],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatBubble);
    component = fixture.componentInstance;

    // Set required input
    fixture.componentRef.setInput('message', mockBotMessage);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render bot message with correct sender', () => {
    expect(component.message().sender).toBe('bot');
  });

  it('should accept user messages', () => {
    fixture.componentRef.setInput('message', mockUserMessage);
    fixture.detectChanges();
    expect(component.message().sender).toBe('user');
  });
});
