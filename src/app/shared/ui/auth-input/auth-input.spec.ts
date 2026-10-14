import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthInput, type AuthInputType } from './auth-input';

@Component({
  imports: [ReactiveFormsModule, AuthInput],
  template: `<app-auth-input [type]="type" placeholder="Password" [formControl]="control" />`,
})
class HostComponent {
  type: AuthInputType = 'password';
  readonly control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
}

describe('AuthInput', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input') as HTMLInputElement;
    return { fixture, el, input };
  }

  it('syncs typed value to the form control', () => {
    const { fixture, input } = setup();
    input.value = 'secret';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.control.value).toBe('secret');
  });

  it('shows the required message only after the field is touched', () => {
    const { fixture, el, input } = setup();
    expect(el.querySelector('.auth-error')).toBeNull();

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(el.querySelector('.auth-error')?.textContent?.trim()).toBe('Password is required');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('toggles password visibility', () => {
    const { fixture, el, input } = setup();
    const toggle = el.querySelector('.auth-input__toggle') as HTMLButtonElement;

    expect(input.type).toBe('password');
    toggle.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Hide password');
  });

  it('has no toggle for non-password types', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.type = 'email';
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.auth-input__toggle')).toBeNull();
  });
});
