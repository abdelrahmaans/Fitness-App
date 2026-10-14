import { TestBed } from '@angular/core/testing';

import { ChatBotService } from './chat-bot.service';

describe('ChatBotService', () => {
  let service: ChatBotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatBotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default greeting message', () => {
    expect(service.messages().length).toBe(1);
    expect(service.messages()[0].text).toBe('Hello, how can I assist you?');
    expect(service.messages()[0].sender).toBe('bot');
  });

  it('should initialize with isLoading as false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should have hasMessages computed as true when initial message is present', () => {
    expect(service.hasMessages()).toBe(true);
  });

  it('should start a new conversation with default greeting message', () => {
    service.startNewConversation();
    expect(service.messages().length).toBe(1);
    expect(service.messages()[0].text).toBe('Hello, how can I assist you?');
  });

  it('should delete a conversation and persist changes to localStorage', () => {
    service.conversations.set([
      {
        id: 'test-convo-id',
        title: 'Test conversation',
        messages: [],
        createdAt: new Date(),
      },
    ]);
    service.deleteConversation('test-convo-id');
    expect(service.conversations().length).toBe(0);
  });
});
