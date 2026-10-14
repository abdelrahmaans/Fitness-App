import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faApple, faFacebookF, faGoogle } from '@fortawesome/free-brands-svg-icons';

export type AuthSocialProvider = 'facebook' | 'google' | 'apple';

export type AuthSocialProviderConfig = {
  id: AuthSocialProvider;
  /** Used in `aria-label`: "Continue with {name}" */
  name: string;
  icon: IconDefinition;
};

export const AUTH_SOCIAL_PROVIDERS: readonly AuthSocialProviderConfig[] = [
  { id: 'facebook', name: 'Facebook', icon: faFacebookF },
  { id: 'google', name: 'Google', icon: faGoogle },
  { id: 'apple', name: 'Apple', icon: faApple },
];
