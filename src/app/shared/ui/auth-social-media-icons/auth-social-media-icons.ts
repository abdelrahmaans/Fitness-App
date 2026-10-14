import { Component } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AUTH_SOCIAL_PROVIDERS } from '../../utils/auth-social-media-icons.config';

/** Social provider icons (display only). Wire OAuth redirects on the page later. */
@Component({
  selector: 'app-auth-social-media-icons',
  imports: [FaIconComponent],
  templateUrl: './auth-social-media-icons.html',
  styleUrl: './auth-social-media-icons.scss',
})
export class AuthSocialMediaIcons {
  protected readonly providers = AUTH_SOCIAL_PROVIDERS;
}
