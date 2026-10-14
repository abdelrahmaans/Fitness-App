import { Component, computed, inject, input, signal } from '@angular/core';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import {
  type LucideIcon,
  LucideDynamicIcon,
  LucideEye,
  LucideEyeOff,
  LucideLock,
  LucideMail,
  LucideUser,
} from '@lucide/angular';
import { getAuthErrorMessage } from '../../utils/auth-error-message';
import { AuthError } from '../auth-error/auth-error';

export type AuthInputType = 'text' | 'email' | 'password';

const DEFAULT_ICONS: Record<AuthInputType, LucideIcon> = {
  text: LucideUser,
  email: LucideMail,
  password: LucideLock,
};

let nextId = 0;

/**
 * Pill input for auth forms. Use with `formControlName` / `[formControl]`.
 * The leading icon defaults from `type` (text → user, email → mail, password → lock).
 */
@Component({
  selector: 'app-auth-input',
  imports: [LucideDynamicIcon, LucideEye, LucideEyeOff, AuthError],
  templateUrl: './auth-input.html',
  styleUrl: './auth-input.scss',
})
export class AuthInput implements ControlValueAccessor {
  readonly type = input<AuthInputType>('text');
  readonly placeholder = input.required<string>();
  readonly icon = input<LucideIcon>();
  readonly autocomplete = input('off');

  protected readonly id = `auth-input-${nextId++}`;
  protected readonly errorId = `${this.id}-error`;
  protected readonly value = signal('');
  protected readonly disabled = signal(false);
  protected readonly passwordVisible = signal(false);

  protected readonly leadingIcon = computed(() => this.icon() ?? DEFAULT_ICONS[this.type()]);
  protected readonly inputType = computed(() =>
    this.type() === 'password' && this.passwordVisible() ? 'text' : this.type(),
  );

  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  protected get errorMessage(): string | null {
    const control = this.ngControl?.control;
    if (!control?.invalid || !control.touched) {
      return null;
    }
    return getAuthErrorMessage(control.errors, this.placeholder());
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  protected togglePassword(): void {
    this.passwordVisible.update((visible) => !visible);
  }
}
