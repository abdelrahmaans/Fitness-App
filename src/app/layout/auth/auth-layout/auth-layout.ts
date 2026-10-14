import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageSwitcher } from '../../../shared/components/language-switcher/language-switcher';
import { AuthAside } from '../auth-aside/auth-aside';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, AuthAside, LanguageSwitcher],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {}
