import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatBotService } from './chat-bot.service';

interface ChatBotServiceTestAccess {
  createChatSession(modelName: string, history?: unknown[]): unknown;
}

describe('ChatBotService', () => {
  let service: ChatBotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatBotService);
    service.startNewConversation();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default greeting message', () => {
    expect(service.messages().length).toBe(1);
    expect(service.messages()[0].text).toBe('Hello How Can I Assist You Today ?');
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
    expect(service.messages()[0].text).toBe('Hello How Can I Assist You Today ?');
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

  it('should expose currentModelName computed signal', () => {
    expect(service.currentModelName()).toBeDefined();
    expect(typeof service.currentModelName()).toBe('string');
  });

  it('should switch to the next model when the current model fails', async () => {
    let callCount = 0;
    const sessionMock1 = {
      sendMessage: vi.fn().mockRejectedValue(new Error('Model 1 error')),
    };
    const sessionMock2 = {
      sendMessage: vi.fn().mockResolvedValue({
        response: { text: () => 'Response from model 2' },
      }),
    };

    const target = service as unknown as ChatBotServiceTestAccess;
    vi.spyOn(target, 'createChatSession').mockImplementation(() => {
      callCount++;
      return (callCount === 1 ? sessionMock1 : sessionMock2);
    });

    await service.sendMessage('Hello');

    const msgs = service.messages();
    expect(msgs[msgs.length - 1].text).toBe('Response from model 2');
    expect(service.activeModelIndex()).toBe(1);
    expect(service.isLoading()).toBe(false);
  });

  it('should deliver contextual fallback response if all models fail, ensuring messages never fail', async () => {
    const target = service as unknown as ChatBotServiceTestAccess;
    vi.spyOn(target, 'createChatSession').mockReturnValue(null);

    await service.sendMessage('What workout should I do for chest?');

    const msgs = service.messages();
    expect(msgs.length).toBe(3);
    expect(msgs[1].sender).toBe('user');
    expect(msgs[1].text).toBe('What workout should I do for chest?');
    expect(msgs[2].sender).toBe('bot');
    expect(msgs[2].text).toContain('compound movements');
    expect(service.isLoading()).toBe(false);
  });

  it('should cycle through multiple failed models until finding a responsive model', async () => {
    let callCount = 0;
    const sessionFail = {
      sendMessage: vi.fn().mockRejectedValue(new Error('Quota exceeded')),
    };
    const sessionSuccess = {
      sendMessage: vi.fn().mockResolvedValue({
        response: { text: () => 'Response from model 3' },
      }),
    };

    const target = service as unknown as ChatBotServiceTestAccess;
    vi.spyOn(target, 'createChatSession').mockImplementation(() => {
      callCount++;
      return callCount < 3 ? sessionFail : sessionSuccess;
    });

    await service.sendMessage('Plan my routine');

    const msgs = service.messages();
    expect(msgs[msgs.length - 1].text).toBe('Response from model 3');
    expect(service.activeModelIndex()).toBe(2);
    expect(service.isLoading()).toBe(false);
  });

  it('should deliver Arabic workout fallback response if all models fail', async () => {
    const target = service as unknown as ChatBotServiceTestAccess;
    vi.spyOn(target, 'createChatSession').mockReturnValue(null);

    await service.sendMessage('عايز جدول تمرين للصدر والحديد');

    const msgs = service.messages();
    const lastMsg = msgs[msgs.length - 1];
    expect(lastMsg.sender).toBe('bot');
    expect(lastMsg.text).toContain('التمارين المركبة');
    expect(service.isLoading()).toBe(false);
  });

  it('should deliver Arabic diet fallback response if all models fail', async () => {
    const target = service as unknown as ChatBotServiceTestAccess;
    vi.spyOn(target, 'createChatSession').mockReturnValue(null);

    await service.sendMessage('كمية البروتين والدايت اليومية');

    const msgs = service.messages();
    const lastMsg = msgs[msgs.length - 1];
    expect(lastMsg.sender).toBe('bot');
    expect(lastMsg.text).toContain('بروتين');
    expect(service.isLoading()).toBe(false);
  });

  it('should not send message or call models when input is only whitespace', async () => {
    const initialCount = service.messages().length;
    await service.sendMessage('   ');
    expect(service.messages().length).toBe(initialCount);
  });
});
