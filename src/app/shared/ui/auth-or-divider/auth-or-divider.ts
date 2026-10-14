import { Component, computed, inject, input } from '@angular/core';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-auth-or-divider',
  templateUrl: './auth-or-divider.html',
  styleUrl: './auth-or-divider.scss',
})
export class AuthOrDivider {
  private readonly translationService = inject(TranslationService, { optional: true });

  readonly label = input<string>();

  protected readonly displayLabel = computed(() => {
    return this.label() ?? this.translationService?.translate('COMMON.OR') ?? 'Or';
  });
}
