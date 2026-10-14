import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { ChatBot } from './layout/chat-bot/chat-bot';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatBot],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly title = signal('super-fitness');

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /**
   * The chatbot is hidden when logged out or inside the auth layout.
   */
  readonly showChatBot = computed(() => {
    const isAuth = this.authService.isAuthenticated();
    const url = this.currentUrl() ?? '';
    const isAuthLayout = url.startsWith('/auth');
    return isAuth && !isAuthLayout;
  });
}
