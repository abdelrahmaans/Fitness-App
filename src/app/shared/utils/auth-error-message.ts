import type { ValidationErrors } from '@angular/forms';

export function getAuthErrorMessage(errors: ValidationErrors | null | undefined, label: string): string | null {
  if (!errors) {
    return null;
  }

  if (errors['required']) {
    return `${label} is required`;
  }

  if (errors['passwordMismatch']) {
    return 'Passwords do not match';
  }

  if (errors['email']) {
    return 'Please enter a valid email';
  }

  if (errors['strongPassword']) {
    return 'Use 8+ characters with upper, lower, and number';
  }

  return null;
}
