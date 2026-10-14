import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthOtpInput } from './auth-otp-input';

@Component({
  imports: [AuthOtpInput],
  template: `
    <app-auth-otp-input
      [length]="length()"
      [(value)]="otpValue"
      (completed)="onCompleted($event)"
    />
  `,
})
class HostComponent {
  readonly length = signal(6);
  otpValue = '';
  completedCode = '';

  onCompleted(code: string): void {
    this.completedCode = code;
  }
}

describe('AuthOtpInput', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the configured number of inputs', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input');
    expect(inputs.length).toBe(6);
  });

  it('renders 4 inputs when length is set to 4', () => {
    host.length.set(4);
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('input');
    expect(inputs.length).toBe(4);
  });

  it('updates value and emits completed when all digits are typed', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

    inputs[0].value = '1';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = '2';
    inputs[1].dispatchEvent(new Event('input'));
    inputs[2].value = '3';
    inputs[2].dispatchEvent(new Event('input'));
    inputs[3].value = '4';
    inputs[3].dispatchEvent(new Event('input'));
    inputs[4].value = '5';
    inputs[4].dispatchEvent(new Event('input'));
    inputs[5].value = '6';
    inputs[5].dispatchEvent(new Event('input'));

    fixture.detectChanges();
    expect(host.otpValue).toBe('123456');
    expect(host.completedCode).toBe('123456');
  });

  it('handles paste of full OTP code', () => {
    const container = fixture.nativeElement.querySelector('.auth-otp-input');
    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;

    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: {
        getData: (format: string) => (format === 'text' ? '754274' : ''),
      },
    });

    container.dispatchEvent(pasteEvent);
    fixture.detectChanges();

    expect(host.otpValue).toBe('754274');
    expect(host.completedCode).toBe('754274');
  });

  it('handles backspace to clear previous input', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

    inputs[0].value = '1';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = '2';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.otpValue).toBe('12');

    // Backspace on slot 1
    inputs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    fixture.detectChanges();

    expect(host.otpValue).toBe('1');
  });
});
