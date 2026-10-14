import { TestBed } from '@angular/core/testing';
import { AuthNumberPicker } from './auth-number-picker';

describe('AuthNumberPicker', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AuthNumberPicker] }).compileComponents();
  });

  function create(min = 85, max = 94, unit: 'kg' | 'cm' | 'yr' = 'kg', value?: number) {
    const fixture = TestBed.createComponent(AuthNumberPicker);
    fixture.componentRef.setInput('min', min);
    fixture.componentRef.setInput('max', max);
    fixture.componentRef.setInput('unit', unit);
    if (value !== undefined) {
      fixture.componentRef.setInput('value', value);
    }
    fixture.detectChanges();
    return fixture;
  }

  it('shows the unit label', () => {
    const fixture = create(85, 94, 'kg', 90);
    const label = fixture.nativeElement.querySelector('.auth-number-picker__unit') as HTMLSpanElement;
    expect(label.textContent?.trim()).toBe('Kg');
  });

  it('maps cm and yr units', () => {
    const cm = create(160, 170, 'cm', 167);
    expect(cm.nativeElement.querySelector('.auth-number-picker__unit')?.textContent?.trim()).toBe('CM');

    const yr = create(20, 30, 'yr', 25);
    expect(yr.nativeElement.querySelector('.auth-number-picker__unit')?.textContent?.trim()).toBe('Yr');
  });

  it('renders the full range when it is smaller than nine values', () => {
    const fixture = create(88, 92, 'kg', 90);
    const items = fixture.nativeElement.querySelectorAll('.auth-number-picker__item');
    expect(items.length).toBe(5);
    expect(Array.from(items).map((el) => (el as HTMLElement).textContent?.trim())).toEqual([
      '88',
      '89',
      '90',
      '91',
      '92',
    ]);
  });

  it('updates value when a number is clicked', () => {
    const fixture = create(88, 92, 'kg', 90);
    const buttons = fixture.nativeElement.querySelectorAll(
      '.auth-number-picker__item',
    ) as NodeListOf<HTMLButtonElement>;

    buttons[4].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe(92);
  });

  it('highlights the selected value in orange', () => {
    const fixture = create(88, 92, 'kg', 90);
    const selected = fixture.nativeElement.querySelector(
      '.auth-number-picker__item--d0',
    ) as HTMLButtonElement;

    expect(selected.textContent?.trim()).toBe('90');
  });

  it('shows nine values with four on each side of the selection', () => {
    const fixture = create(10, 100, 'yr', 50);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.auth-number-picker__item');
    expect(items.length).toBe(9);
    expect(Array.from(items).map((el) => (el as HTMLElement).textContent?.trim())).toEqual([
      '46',
      '47',
      '48',
      '49',
      '50',
      '51',
      '52',
      '53',
      '54',
    ]);
  });

  it('shifts the window near the minimum while keeping nine values', () => {
    const fixture = create(10, 100, 'yr', 12);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.auth-number-picker__item');
    expect(items.length).toBe(9);
    expect(Array.from(items).map((el) => (el as HTMLElement).textContent?.trim())).toEqual([
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
    ]);
  });
});
