import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';

import { ChatBotService } from '../../chat-bot.service';
import type { Conversation } from '../../chat-bot.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { RightArrowIcon } from '../../../../shared/ui/right-arrow-icon/right-arrow-icon';

@Component({
  selector: 'app-previous-conversations',
  templateUrl: './previous-conversations.html',
  styleUrl: './previous-conversations.scss',
  imports: [TranslatePipe, RightArrowIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviousConversations {
  private readonly chatBotService = inject(ChatBotService);

  /** All saved conversations from the service */
  readonly conversations = this.chatBotService.conversations;

  /** Emits when the drawer should be closed */
  readonly closed = output<void>();

  onSelectConversation(conversation: Conversation): void {
    this.chatBotService.loadConversation(conversation);
    this.closed.emit();
  }

  onNewConversation(): void {
    this.chatBotService.startNewConversation();
    this.closed.emit();
  }
}
