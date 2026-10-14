import {
  Component,
  ElementRef,
  computed,
  input,
  model,
  output,
  viewChildren,
} from '@angular/core';

/**
 * Reusable multi-box OTP / Verification code input.
 * Supports configurable length, auto-focus next, backspace navigation, and paste handling.
 */
@Component({
  selector: 'app-auth-otp-input',
  host: { class: 'block w-full' },
  templateUrl: './auth-otp-input.html',
  styleUrl: './auth-otp-input.scss',
})
export class AuthOtpInput {
  readonly length = input<number>(6);
  readonly value = model<string>('');
  readonly completed = output<string>();

  private readonly inputRefs = viewChildren<ElementRef<HTMLInputElement>>('otpInput');

  protected readonly digits = computed(() => {
    const val = this.value();
    const len = this.length();
    const arr: string[] = [];
    for (let i = 0; i < len; i++) {
      arr.push(val[i] ?? '');
    }
    return arr;
  });

  protected readonly slots = computed(() => Array.from({ length: this.length() }, (_, i) => i));

  protected onInput(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const inputValue = target.value;

    // Handle single digit input
    const cleanDigit = inputValue.replace(/\D/g, '').slice(-1);
    this.updateDigit(index, cleanDigit);

    target.value = cleanDigit;

    if (cleanDigit && index < this.length() - 1) {
      this.focusInput(index + 1);
    }

    this.checkCompletion();
  }

  protected onKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      const inputs = this.inputRefs();
      const currentInput = inputs[index]?.nativeElement;

      if (!currentInput?.value && index > 0) {
        event.preventDefault();
        this.updateDigit(index - 1, '');
        this.focusInput(index - 1);
        this.checkCompletion();
      } else {
        this.updateDigit(index, '');
        this.checkCompletion();
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusInput(index - 1);
    } else if (event.key === 'ArrowRight' && index < this.length() - 1) {
      event.preventDefault();
      this.focusInput(index + 1);
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') ?? '';
    const digitsOnly = pastedData.replace(/\D/g, '').slice(0, this.length());

    if (!digitsOnly) {
      return;
    }

    this.value.set(digitsOnly);

    // Update native inputs directly for instant feedback
    const inputs = this.inputRefs();
    for (let i = 0; i < this.length(); i++) {
      if (inputs[i]?.nativeElement) {
        inputs[i].nativeElement.value = digitsOnly[i] ?? '';
      }
    }

    const nextIndex = Math.min(digitsOnly.length, this.length() - 1);
    this.focusInput(nextIndex);

    this.checkCompletion();
  }

  private updateDigit(index: number, digit: string): void {
    const current = this.digits().slice();
    current[index] = digit;
    const newValue = current.join('').trimEnd();
    this.value.set(newValue);
  }

  private checkCompletion(): void {
    const current = this.digits().join('');
    if (current.length === this.length() && /^\d+$/.test(current)) {
      this.completed.emit(current);
    }
  }

  private focusInput(index: number): void {
    const inputs = this.inputRefs();
    inputs[index]?.nativeElement?.focus();
  }
}
