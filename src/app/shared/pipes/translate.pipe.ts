import { Pipe, type PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';

/**
 * Custom translation pipe that looks up keys from TranslationService.
 * Configured with pure: false so template bindings automatically update
 * when active language signal changes.
 *
 * Usage:
 *   {{ 'WELCOME' | translate }}
 *   {{ 'GREETING' | translate: { name: 'Sarah' } }}
 */
@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(key: string | null | undefined, params?: Record<string, string | number>): string {
    if (!key) {
      return '';
    }
    return this.translationService.translate(key, params);
  }
}
