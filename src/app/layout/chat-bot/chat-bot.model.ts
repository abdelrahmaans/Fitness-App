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
