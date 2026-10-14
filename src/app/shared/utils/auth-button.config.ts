export type AuthButtonKind =
  | 'login'
  | 'register'
  | 'next'
  | 'previous'
  | 'done'
  | 'confirm'
  | 'sentOtp';

export type AuthButtonTone = 'primary' | 'secondary';

export type AuthButtonConfig = {
  label: string;
  tone: AuthButtonTone;
};

/** Default copy and styling per auth CTA (always enabled — validate on click in the page). */
export const AUTH_BUTTON_CONFIG: Record<AuthButtonKind, AuthButtonConfig> = {
  login: { label: 'Login', tone: 'primary' },
  register: { label: 'Register', tone: 'primary' },
  next: { label: 'Next', tone: 'primary' },
  previous: { label: 'Previous', tone: 'secondary' },
  done: { label: 'Done', tone: 'primary' },
  confirm: { label: 'Confirm', tone: 'primary' },
  sentOtp: { label: 'Sent OTP', tone: 'primary' },
};
