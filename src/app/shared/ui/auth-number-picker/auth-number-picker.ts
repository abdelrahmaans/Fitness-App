import { afterNextRender, Component, computed, inject, input, model, signal } from '@angular/core';
import { TranslationService } from '../../../core/services/translation.service';

export type AuthNumberPickerUnit = 'kg' | 'cm' | 'yr';

const UNIT_LABELS: Record<AuthNumberPickerUnit, string> = {
  kg: 'Kg',
  cm: 'CM',
  yr: 'Yr',
};

/** Figma: one active value with four numbers on each side (nine total). */
const VISIBLE_RADIUS = 4;
const WINDOW_SIZE = VISIBLE_RADIUS * 2 + 1;
/** Horizontal drag distance before the value changes by one step. */
const PIXELS_PER_STEP = 32;
const DRAG_CLICK_THRESHOLD_PX = 6;

/**
 * Horizontal number wheel for onboarding (weight, height, age).
 * Bind with `[(value)]`, `unit`, `min`, and `max`.
 */
@Component({
  selector: 'app-auth-number-picker',
  templateUrl: './auth-number-picker.html',
  styleUrl: './auth-number-picker.scss',
})
export class AuthNumberPicker {
  private readonly translationService = inject(TranslationService, { optional: true });

  readonly unit = input.required<AuthNumberPickerUnit>();
  readonly min = input.required<number>();
  readonly max = input.required<number>();
  readonly value = model<number>();

  protected readonly isDragging = signal(false);
  protected readonly dragOffsetPx = signal(0);

  protected readonly rowTransform = computed(() => {
    const offset = this.dragOffsetPx();
    if (offset === 0) {
      return undefined;
    }
    return `translateX(${offset}px)`;
  });

  protected readonly unitLabel = computed(() => {
    const u = this.unit();
    if (this.translationService?.isArabic()) {
      if (u === 'kg') return 'كجم';
      if (u === 'cm') return 'سم';
      if (u === 'yr') return 'سنة';
    }
    return UNIT_LABELS[u];
  });

  protected readonly windowNumbers = computed(() => {
    const min = this.min();
    const max = this.max();
    const center = this.value() ?? Math.round((min + max) / 2);

    if (max - min + 1 <= WINDOW_SIZE) {
      const all: number[] = [];
      for (let n = min; n <= max; n++) {
        all.push(n);
      }
      return all;
    }

    let start = center - VISIBLE_RADIUS;
    let end = center + VISIBLE_RADIUS;

    if (start < min) {
      start = min;
      end = min + WINDOW_SIZE - 1;
    } else if (end > max) {
      end = max;
      start = max - WINDOW_SIZE + 1;
    }

    const values: number[] = [];
    for (let n = start; n <= end; n++) {
      values.push(n);
    }
    return values;
  });

  private dragAnchorX = 0;
  private valueAtDragStart = 0;
  private activePointerId: number | null = null;
  private dragMoved = false;

  constructor() {
    afterNextRender(() => {
      if (this.value() === undefined) {
        this.value.set(Math.round((this.min() + this.max()) / 2));
      }
    });
  }

  protected selectValue(n: number, event?: MouseEvent): void {
    if (this.dragMoved) {
      event?.preventDefault();
      event?.stopPropagation();
      return;
    }
    this.value.set(n);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    const row = event.currentTarget as HTMLElement;
    row.setPointerCapture(event.pointerId);

    this.activePointerId = event.pointerId;
    this.isDragging.set(true);
    this.dragMoved = false;
    this.dragAnchorX = event.clientX;
    this.valueAtDragStart = this.value() ?? this.min();
    this.dragOffsetPx.set(0);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.isDragging() || event.pointerId !== this.activePointerId) {
      return;
    }

    const delta = event.clientX - this.dragAnchorX;
    if (Math.abs(delta) > DRAG_CLICK_THRESHOLD_PX) {
      this.dragMoved = true;
    }

    const next = this.valueFromDragDelta(delta);
    this.value.set(next);

    const snappedDelta = -(next - this.valueAtDragStart) * PIXELS_PER_STEP;
    let remainder = delta - snappedDelta;

    if (next <= this.min() && remainder > 0) {
      remainder *= 0.35;
    } else if (next >= this.max() && remainder < 0) {
      remainder *= 0.35;
    }

    this.dragOffsetPx.set(remainder);
  }

  protected onPointerUp(event: PointerEvent): void {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    this.finishDrag(event.currentTarget as HTMLElement);
  }

  protected onPointerCancel(event: PointerEvent): void {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    this.finishDrag(event.currentTarget as HTMLElement);
  }

  protected distanceFromSelection(n: number): number {
    return Math.abs(n - (this.value() ?? this.min()));
  }

  protected isSelected(n: number): boolean {
    return n === (this.value() ?? this.min());
  }

  protected itemDistanceClass(n: number): string {
    const distance = Math.min(this.distanceFromSelection(n), VISIBLE_RADIUS);
    return `auth-number-picker__item--d${distance}`;
  }

  private valueFromDragDelta(delta: number): number {
    const steps = Math.round(-delta / PIXELS_PER_STEP);
    const next = this.valueAtDragStart + steps;
    return Math.min(this.max(), Math.max(this.min(), next));
  }

  private finishDrag(row: HTMLElement): void {
    if (this.activePointerId !== null) {
      row.releasePointerCapture(this.activePointerId);
    }

    this.activePointerId = null;
    this.isDragging.set(false);
    this.dragOffsetPx.set(0);

    setTimeout(() => {
      this.dragMoved = false;
    }, 0);
  }
}
