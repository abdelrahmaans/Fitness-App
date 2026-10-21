/** Identifies the sender of a chat message */
export type ChatMessageSender = 'user' | 'bot';

/** Represents a single message in the chat */
export interface ChatMessage {
  readonly sender: ChatMessageSender;
  readonly text: string;
  readonly translationKey?: string;
  readonly timestamp: Date;
}

/** Represents a saved conversation with a title preview and its messages */
export interface Conversation {
  readonly id: string;
  readonly title: string;
  readonly messages: ChatMessage[];
  readonly createdAt: Date;
}

/**
 * Prioritized list of Google Gemini models to cycle through.
 * If one model encounters an issue (such as quota exceeded, deprecation, or rate limiting),
 * the system seamlessly and automatically switches to another available model
 * in the Google Gemini suite without requiring any user action.
 */
export const GEMINI_FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-pro-preview',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
] as const;

export type GeminiModelName = (typeof GEMINI_FALLBACK_MODELS)[number];

