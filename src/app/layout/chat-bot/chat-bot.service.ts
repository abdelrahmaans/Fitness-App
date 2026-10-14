import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatSession } from '@google/generative-ai';

import type { ChatMessage, Conversation } from './chat-bot.model';
import { environment } from '../../../environments/environment';

const SYSTEM_INSTRUCTION =
  "You are 'Smart Coach', a professional and motivational fitness assistant in a gym. " +
  'Provide short, instant fitness advice. ' +
  'Do not answer questions outside the scope of sports, health, and gym facilities.';

const CONVERSATIONS_STORAGE_KEY = 'smart_coach_conversations';
const ACTIVE_CONVERSATION_ID_KEY = 'smart_coach_active_conversation_id';
const DEFAULT_BOT_MESSAGE_TEXT = 'Hello How Can I Assist You Today ?';

function createDefaultBotMessage(): ChatMessage {
  return {
    sender: 'bot',
    text: DEFAULT_BOT_MESSAGE_TEXT,
    timestamp: new Date(),
  };
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

@Injectable({ providedIn: 'root' })
export class ChatBotService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private genAI: GoogleGenerativeAI | null = null;
  private chatSession: ChatSession | null = null;

  /** Signal holding all messages for the current active conversation */
  readonly messages = signal<ChatMessage[]>([createDefaultBotMessage()]);

  /** Signal holding all saved previous conversations */
  readonly conversations = signal<Conversation[]>([]);

  /** Signal tracking whether a bot response is being generated */
  readonly isLoading = signal(false);

  /** Computed: the current active conversation id */
  private readonly activeConversationId = signal<string | null>(null);

  /** Computed: whether there are any messages in the current chat */
  readonly hasMessages = computed(() => this.messages().length > 0);

  constructor() {
    if (this.isBrowser) {
      this.initializeGenAI();
      this.loadConversationsFromStorage();
    }
  }

  /**
   * Initializes the Google Generative AI client and starts a fresh chat session.
   */
  private initializeGenAI(): void {
    this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
    this.startNewChatSession();
  }

  /**
   * Creates a new chat session with the Gemini model,
   * optionally seeding it with existing history.
   */
  private startNewChatSession(
    history: Array<{ role: string; parts: Array<{ text: string }> }> = []
  ): void {
    if (!this.genAI) return;

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    this.chatSession = model.startChat({ history });
  }

  /**
   * Sends a user message and receives a bot response from Gemini.
   * Both the user message and bot response are saved to localStorage.
   */
  async sendMessage(text: string): Promise<void> {
    if (!this.chatSession || !text.trim()) return;

    const userMessage: ChatMessage = {
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    this.messages.update((msgs) => [...msgs, userMessage]);
    this.saveCurrentConversation();
    this.isLoading.set(true);

    try {
      const result = await this.chatSession.sendMessage(text.trim());
      const responseText = result.response.text();

      const botMessage: ChatMessage = {
        sender: 'bot',
        text: responseText,
        timestamp: new Date(),
      };

      this.messages.update((msgs) => [...msgs, botMessage]);
      this.saveCurrentConversation();
    } catch {
      const errorMessage: ChatMessage = {
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      this.messages.update((msgs) => [...msgs, errorMessage]);
      this.saveCurrentConversation();
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Starts a brand-new conversation, saving the current one if it has user messages.
   */
  startNewConversation(): void {
    this.saveCurrentConversation();
    this.messages.set([createDefaultBotMessage()]);
    this.activeConversationId.set(null);
    this.saveActiveConversationIdToStorage();
    this.startNewChatSession();
  }

  /**
   * Loads a previously saved conversation into the active chat and
   * re-seeds the Gemini session with its history.
   */
  loadConversation(conversation: Conversation): void {
    this.saveCurrentConversation();
    this.messages.set([...conversation.messages]);
    this.activeConversationId.set(conversation.id);
    this.saveActiveConversationIdToStorage();

    // Re-seed the Gemini chat session with the loaded conversation history.
    // Gemini history MUST start with a 'user' role. Skip leading bot messages.
    const firstUserIndex = conversation.messages.findIndex(
      (msg) => msg.sender === 'user'
    );

    const validMessages =
      firstUserIndex !== -1
        ? conversation.messages.slice(firstUserIndex)
        : [];

    const history = validMessages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    this.startNewChatSession(history);
  }

  /**
   * Deletes a conversation from history and updates localStorage.
   */
  deleteConversation(conversationId: string): void {
    this.conversations.update((convos) =>
      convos.filter((c) => c.id !== conversationId)
    );
    this.saveConversationsToStorage();

    if (this.activeConversationId() === conversationId) {
      this.messages.set([createDefaultBotMessage()]);
      this.activeConversationId.set(null);
      this.saveActiveConversationIdToStorage();
      this.startNewChatSession();
    }
  }

  /**
   * Persists the current conversation to the conversations list
   * and saves it to localStorage.
   */
  private saveCurrentConversation(): void {
    const currentMessages = this.messages();
    const firstUserMessage = currentMessages.find((m) => m.sender === 'user');
    if (!firstUserMessage) return;

    let activeId = this.activeConversationId();
    const title = firstUserMessage.text.substring(0, 40);

    if (activeId) {
      // Update existing conversation in list
      this.conversations.update((convos) => {
        const exists = convos.some((c) => c.id === activeId);
        if (exists) {
          return convos.map((c) =>
            c.id === activeId
              ? { ...c, messages: [...currentMessages], title }
              : c
          );
        }
        const updatedConversation: Conversation = {
          id: activeId!,
          title,
          messages: [...currentMessages],
          createdAt: new Date(),
        };
        return [updatedConversation, ...convos];
      });
    } else {
      // Create new conversation entry
      activeId = generateUUID();
      this.activeConversationId.set(activeId);

      const newConversation: Conversation = {
        id: activeId,
        title,
        messages: [...currentMessages],
        createdAt: new Date(),
      };

      this.conversations.update((convos) => [newConversation, ...convos]);
    }

    this.saveConversationsToStorage();
    this.saveActiveConversationIdToStorage();
  }

  /**
   * Saves conversations to localStorage.
   */
  private saveConversationsToStorage(): void {
    if (!this.isBrowser) return;

    try {
      const data = JSON.stringify(this.conversations());
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, data);
    } catch {
      // Storage quota exceeded or unavailable — silently ignore
    }
  }

  /**
   * Saves active conversation ID to localStorage.
   */
  private saveActiveConversationIdToStorage(): void {
    if (!this.isBrowser) return;

    try {
      const activeId = this.activeConversationId();
      if (activeId) {
        localStorage.setItem(ACTIVE_CONVERSATION_ID_KEY, activeId);
      } else {
        localStorage.removeItem(ACTIVE_CONVERSATION_ID_KEY);
      }
    } catch {
      // Storage unavailable — silently ignore
    }
  }

  /**
   * Loads conversations and restored active conversation from localStorage.
   */
  private loadConversationsFromStorage(): void {
    if (!this.isBrowser) return;

    try {
      const data = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as Array<{
          id: string;
          title: string;
          createdAt: string;
          messages: Array<{
            sender: 'user' | 'bot';
            text: string;
            timestamp: string;
          }>;
        }>;

        const loadedConversations: Conversation[] = parsed.map((c) => ({
          id: c.id,
          title: c.title,
          createdAt: new Date(c.createdAt),
          messages: c.messages.map((m) => {
            const isDefault =
              m.text === 'CHATBOT.DEFAULT_BOT_MESSAGE' ||
              m.text === DEFAULT_BOT_MESSAGE_TEXT ||
              m.text === 'Hello, how can I assist you?';
            const isError = m.text === 'CHATBOT.ERROR_MESSAGE';

            return {
              sender: m.sender,
              text: isDefault
                ? DEFAULT_BOT_MESSAGE_TEXT
                : isError
                  ? 'Sorry, I encountered an error. Please try again.'
                  : m.text,
              timestamp: new Date(m.timestamp),
            };
          }),
        }));

        this.conversations.set(loadedConversations);

        // Restore active conversation if one was saved
        const savedActiveId = localStorage.getItem(ACTIVE_CONVERSATION_ID_KEY);
        if (savedActiveId) {
          const activeConvo = loadedConversations.find(
            (c) => c.id === savedActiveId
          );
          if (activeConvo) {
            this.messages.set([...activeConvo.messages]);
            this.activeConversationId.set(activeConvo.id);

            // Re-seed Gemini history
            const firstUserIndex = activeConvo.messages.findIndex(
              (m) => m.sender === 'user'
            );
            const validMessages =
              firstUserIndex !== -1
                ? activeConvo.messages.slice(firstUserIndex)
                : [];
            const history = validMessages.map((m) => ({
              role: m.sender === 'user' ? 'user' : 'model',
              parts: [{ text: m.text }],
            }));
            this.startNewChatSession(history);
          }
        }
      }
    } catch {
      // Corrupted data — silently ignore
    }
  }
}
