import { AUTH_BUTTON_CONFIG } from './auth-button.config';

describe('AUTH_BUTTON_CONFIG', () => {
  it('maps primary forward actions and secondary previous', () => {
    expect(AUTH_BUTTON_CONFIG.register.label).toBe('Register');
    expect(AUTH_BUTTON_CONFIG.next.tone).toBe('primary');
    expect(AUTH_BUTTON_CONFIG.previous.tone).toBe('secondary');
  });
});
