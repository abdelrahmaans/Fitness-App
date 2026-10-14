import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-error',
  templateUrl: './auth-error.html',
  styleUrl: './auth-error.scss',
})
export class AuthError {
  readonly message = input.required<string>();
}
