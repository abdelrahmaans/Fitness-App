import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { Account } from './account';

describe('Account Page', () => {
  let fixture: ComponentFixture<Account>;
  let component: Account;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Account],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        AuthService,
        TranslationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Account);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the Account component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the fixed background image with the correct asset path', () => {
    const bgImg = fixture.nativeElement.querySelector('.account__bg-image') as HTMLImageElement;
    expect(bgImg).toBeTruthy();
    expect(bgImg.getAttribute('src')).toBe('/images/bg-img.webp');
  });

  it('should render the background overlay element for theme backdrop styling', () => {
    const overlay = fixture.nativeElement.querySelector('.account__bg-overlay');
    expect(overlay).toBeTruthy();
  });
  it('should render the app-basic-metrics component inside the account content', () => {
    const basicMetrics = fixture.nativeElement.querySelector('app-basic-metrics');
    expect(basicMetrics).toBeTruthy();
  });
});
