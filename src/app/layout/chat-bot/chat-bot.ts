import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ChatBotService } from './chat-bot.service';
import { ChatBubble } from './components/chat-bubble/chat-bubble';
import { PreviousConversations } from './components/previous-conversations/previous-conversations';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-chat-bot',
  imports: [FormsModule, ChatBubble, PreviousConversations, TranslatePipe],
  templateUrl: './chat-bot.html',
  styleUrl: './chat-bot.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatBot {
  protected readonly chatBotService = inject(ChatBotService);

  /** Whether the chat window is open */
  protected readonly isChatOpen = signal(false);

  /** Whether the previous-conversations drawer is visible */
  protected readonly isDrawerOpen = signal(false);

  /** The current input field value */
  protected readonly userInput = signal('');

  /** Reference to the message scroll container */
  protected readonly messagesContainer = viewChild<ElementRef<HTMLDivElement>>('messagesContainer');

  constructor() {
    // Auto-scroll to bottom whenever messages change
    effect(() => {
      this.chatBotService.messages();
      this.scrollToBottom();
    });
  }

  protected toggleChat(): void {
    this.isChatOpen.update((open) => !open);

    if (!this.isChatOpen()) {
      this.isDrawerOpen.set(false);
    }
  }

  protected toggleDrawer(): void {
    this.isDrawerOpen.update((open) => !open);
  }

  protected closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  protected async onSendMessage(): Promise<void> {
    const text = this.userInput().trim();
    if (!text) return;

    this.userInput.set('');
    await this.chatBotService.sendMessage(text);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
    }
  }

  private scrollToBottom(): void {
    // Use setTimeout to ensure DOM has updated after signal change
    setTimeout(() => {
      const container = this.messagesContainer()?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }
}
