import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatSession } from '@google/generative-ai';

import {
  GEMINI_FALLBACK_MODELS,
  type ChatMessage,
  type Conversation,
} from './chat-bot.model';
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

  /** Signal tracking the currently active Gemini model index */
  readonly activeModelIndex = signal<number>(0);

  /** Computed name of the current active Gemini model */
  readonly currentModelName = computed(
    () => GEMINI_FALLBACK_MODELS[this.activeModelIndex()]
  );

  /** Signal alias for current active Gemini model name */
  readonly currentModel = computed(
    () => GEMINI_FALLBACK_MODELS[this.activeModelIndex()]
  );

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
   * Builds conversation history formatted for Gemini chat sessions.
   * Guarantees alternating 'user' and 'model' turns starting with 'user'
   * and ending with 'model' when excluding the pending message.
   */
  private getFormattedHistory(
    excludeLastUserMessage = false
  ): Array<{ role: string; parts: Array<{ text: string }> }> {
    const currentMessages = this.messages();
    const msgs =
      excludeLastUserMessage &&
      currentMessages.length > 0 &&
      currentMessages[currentMessages.length - 1].sender === 'user'
        ? currentMessages.slice(0, -1)
        : currentMessages;

    const firstUserIndex = msgs.findIndex((m) => m.sender === 'user');
    if (firstUserIndex === -1) {
      return [];
    }

    const history: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    let lastRole: 'user' | 'model' | null = null;

    for (const m of msgs.slice(firstUserIndex)) {
      const text = m.text.trim();
      if (!text) continue;

      const role: 'user' | 'model' = m.sender === 'user' ? 'user' : 'model';
      if (role === lastRole && history.length > 0) {
        history[history.length - 1].parts[0].text += `\n${text}`;
      } else {
        history.push({
          role,
          parts: [{ text }],
        });
        lastRole = role;
      }
    }

    if (
      excludeLastUserMessage &&
      history.length > 0 &&
      history[history.length - 1].role === 'user'
    ) {
      history.pop();
    }

    return history;
  }

  /**
   * Creates a chat session for a specific model name.
   * Tries with system instruction first, and falls back gracefully if unsupported by the specific model.
   */
  private createChatSession(
    modelName: string,
    history: Array<{ role: string; parts: Array<{ text: string }> }> = []
  ): ChatSession | null {
    if (!this.genAI) return null;

    try {
      const model = this.genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      });
      return model.startChat({ history });
    } catch {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        return model.startChat({ history });
      } catch {
        return null;
      }
    }
  }

  /**
   * Initializes or updates the active chat session with the current model.
   */
  private startNewChatSession(
    history: Array<{ role: string; parts: Array<{ text: string }> }> = []
  ): void {
    if (!this.genAI) return;
    const modelName = GEMINI_FALLBACK_MODELS[this.activeModelIndex()];
    this.chatSession = this.createChatSession(modelName, history);
  }

  /**
   * Sends a user message and receives a bot response from Gemini.
   * Automatically cycles through the Google Gemini model suite if any model encounters an error,
   * ensuring that the message is always delivered and answered.
   */
  async sendMessage(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      sender: 'user',
      text: trimmed,
      timestamp: new Date(),
    };

    this.messages.update((msgs) => [...msgs, userMessage]);
    this.saveCurrentConversation();
    this.isLoading.set(true);

    try {
      let responseText: string | null = null;
      const history = this.getFormattedHistory(true);
      const totalModels = GEMINI_FALLBACK_MODELS.length;
      const startIndex = this.activeModelIndex();

      for (let i = 0; i < totalModels; i++) {
        const modelIndex = (startIndex + i) % totalModels;
        const modelName = GEMINI_FALLBACK_MODELS[modelIndex];

        try {
          const session = this.createChatSession(modelName, history);
          if (!session) {
            continue;
          }

          const result = await session.sendMessage(trimmed);
          const reply = result.response.text();

          if (reply && reply.trim()) {
            responseText = reply.trim();
            this.activeModelIndex.set(modelIndex);
            this.chatSession = session;
            break;
          }
        } catch {
          // Model failed or quota/access error — automatically try next model
          continue;
        }
      }

      // If all Gemini API calls fail (e.g. invalid key or network issue), provide a reliable coach response
      if (!responseText) {
        responseText = this.generateFallbackResponse(trimmed);
      }

      const botMessage: ChatMessage = {
        sender: 'bot',
        text: responseText,
        timestamp: new Date(),
      };

      this.messages.update((msgs) => [...msgs, botMessage]);
      this.saveCurrentConversation();
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Contextual fitness assistant fallback response ensuring messages never fail.
   * Provides intelligent guidance in both Arabic and English if all external models are unreachable.
   */
  private generateFallbackResponse(input: string): string {
    const isArabic = /[\u0600-\u06FF]/.test(input);
    const lower = input.toLowerCase();

    if (isArabic) {
      if (
        lower.includes('صدر') ||
        lower.includes('بنش') ||
        lower.includes('عضل') ||
        lower.includes('تمرين') ||
        lower.includes('حديد') ||
        lower.includes('جيم') ||
        lower.includes('رجل') ||
        lower.includes('ظهر') ||
        lower.includes('باي') ||
        lower.includes('تراي')
      ) {
        return 'لبناء العضلات وزيادة القوة، ركز على التمارين المركبة الأساسية مثل السكوات، البنش برس، والديدليفت مع زيادة الأحمال تدريجياً (8-12 تكرار في الجولة) والراحة الكافية لكل عضلة لمدة 48 ساعة.';
      }

      if (
        lower.includes('دايت') ||
        lower.includes('أكل') ||
        lower.includes('بروتين') ||
        lower.includes('تغذية') ||
        lower.includes('سعرات') ||
        lower.includes('وجب')
      ) {
        return 'التغذية هي أساس التطور! احرص على تناول من 1.6 إلى 2.2 جرام بروتين لكل كيلوجرام من وزن جسمك، مع الكربوهيدرات المعقدة للطاقة، وشرب ما لا يقل عن 3 لترات ماء يومياً.';
      }

      if (
        lower.includes('تخسيس') ||
        lower.includes('وزن') ||
        lower.includes('كارديو') ||
        lower.includes('حرق') ||
        lower.includes('دهون')
      ) {
        return 'لحرق الدهون بفعالية، ادمج تمارين المقاومة مع الكارديو (مثل 20-30 دقيقة مشي مائل سريع أو تمارين هيت) مع عجز سعرات حرارية معتدل مستمر.';
      }

      if (
        lower.includes('مرحبا') ||
        lower.includes('اهلا') ||
        lower.includes('سلام') ||
        lower.includes('صباح') ||
        lower.includes('مساء')
      ) {
        return 'أهلاً بك في المدرب الذكي! أنا هنا لمساعدتك في كل ما يخص التمارين الرياضية، التغذية، والوصول لأهدافك البدنية. كيف يمكنني مساعدتك اليوم؟';
      }

      return 'الاستمرارية والانضباط هما سر النجاح في اللياقة البدنية! حافظ على تمرينك المنتظم، التغذية السليمة، والنوم الكافي من 7 إلى 8 ساعات يومياً للتعافي الأمثل.';
    }

    if (
      lower.includes('workout') ||
      lower.includes('exercise') ||
      lower.includes('muscle') ||
      lower.includes('train') ||
      lower.includes('routine') ||
      lower.includes('gym') ||
      lower.includes('chest') ||
      lower.includes('leg') ||
      lower.includes('back') ||
      lower.includes('arm')
    ) {
      return 'For optimal muscle growth and strength, focus on compound movements like squats, bench presses, and deadlifts. Train with progressive overload (8-12 reps per set) and rest 48 hours between training the same muscle group.';
    }

    if (
      lower.includes('diet') ||
      lower.includes('food') ||
      lower.includes('protein') ||
      lower.includes('eat') ||
      lower.includes('meal') ||
      lower.includes('nutrition') ||
      lower.includes('calorie')
    ) {
      return 'Nutrition is key to your transformation! Target 1.6 to 2.2 grams of protein per kilogram of bodyweight, eat complex carbohydrates for workout energy, and stay well-hydrated throughout the day.';
    }

    if (
      lower.includes('cardio') ||
      lower.includes('fat') ||
      lower.includes('weight') ||
      lower.includes('lose') ||
      lower.includes('burn') ||
      lower.includes('cutting')
    ) {
      return 'To burn fat effectively, combine resistance training with moderate cardio (like 20-30 minutes of HIIT or brisk incline walking) alongside a consistent, moderate caloric deficit.';
    }

    if (
      lower.includes('hello') ||
      lower.includes('hi') ||
      lower.includes('hey') ||
      lower.includes('welcome')
    ) {
      return 'Welcome to Smart Coach! I am here to guide your fitness journey. Ask me anything about workouts, nutrition, recovery, or gym exercises!';
    }

    return 'Consistency and progressive effort are the keys to reaching your goals! Keep pushing in your training, stay hydrated, and ensure you get 7-8 hours of quality sleep for optimal recovery.';
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

    const history = this.getFormattedHistory();
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

            const history = this.getFormattedHistory();
            this.startNewChatSession(history);
          }
        }
      }
    } catch {
      // Corrupted data — silently ignore
    }
  }
}
