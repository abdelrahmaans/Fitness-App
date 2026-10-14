import { getAuthErrorMessage } from './auth-error-message';

describe('getAuthErrorMessage', () => {
  it('returns null when there are no errors', () => {
    expect(getAuthErrorMessage(null, 'Email')).toBeNull();
  });

  it('builds the required message from the label', () => {
    expect(getAuthErrorMessage({ required: true }, 'First Name')).toBe('First Name is required');
  });

  it('prefers required over email', () => {
    expect(getAuthErrorMessage({ required: true, email: true }, 'Email')).toBe('Email is required');
    expect(getAuthErrorMessage({ email: true }, 'Email')).toBe('Please enter a valid email');
  });

  it('returns the password mismatch message', () => {
    expect(getAuthErrorMessage({ passwordMismatch: true }, 'Confirm Password')).toBe('Passwords do not match');
  });

  it('returns the strong password message', () => {
    expect(getAuthErrorMessage({ strongPassword: true }, 'Password')).toBe(
      'Use 8+ characters with upper, lower, and number',
    );
  });
});
