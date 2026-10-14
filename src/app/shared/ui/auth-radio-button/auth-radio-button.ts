import { Component, input, model } from '@angular/core';

export interface RadioOption<T = unknown> {
  id: string | number;
  label: string;
  value: T;
}

@Component({
  selector: 'app-auth-radio-button',
  imports: [],
  templateUrl: './auth-radio-button.html',
  styleUrl: './auth-radio-button.scss',
})
export class AuthRadioButton<T = unknown> {
  options = input.required<RadioOption<T>[]>();
  value = model<T>();
  name = input<string>(`radio-group-${Math.random().toString(36).substring(2, 9)}`);

  selectOption(optionValue: T): void {
    this.value.set(optionValue);
  }
}
