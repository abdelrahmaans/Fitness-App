import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import type { ChatMessage } from '../../chat-bot.model';

@Component({
  selector: 'app-chat-bubble',
  templateUrl: './chat-bubble.html',
  styleUrl: './chat-bubble.scss',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatBubble {
  /** The chat message to render */
  readonly message = input.required<ChatMessage>();
}
