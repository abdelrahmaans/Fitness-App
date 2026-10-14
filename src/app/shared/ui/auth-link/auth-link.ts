import { Component, input } from '@angular/core';

/**
 * 
 *
 * @example
 * <app-auth-link>
 *   <span text>Dont Have An Account Yet ? </span>
 *   <a link routerLink="/auth/register">Register</a>
 * </app-auth-link>
 */
@Component({
  selector: 'app-auth-link',
  templateUrl: './auth-link.html',
  styleUrl: './auth-link.scss',
})
export class AuthLink {
  /** Tailwind alignment / spacing classes (e.g. `text-center`, `text-end`). */
  readonly customClass = input('text-center');
}
