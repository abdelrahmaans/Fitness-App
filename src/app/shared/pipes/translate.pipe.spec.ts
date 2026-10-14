import { TestBed } from '@angular/core/testing';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from './translate.pipe';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let translationServiceMock: {
    translate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    translationServiceMock = {
      translate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        TranslatePipe,
        { provide: TranslationService, useValue: translationServiceMock },
      ],
    });

    pipe = TestBed.inject(TranslatePipe);
  });

  it('should return empty string if key is empty or null', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(translationServiceMock.translate).not.toHaveBeenCalled();
  });

  it('should delegate translation to TranslationService', () => {
    translationServiceMock.translate.mockReturnValue('Welcome to Super Fitness');

    const result = pipe.transform('WELCOME');

    expect(translationServiceMock.translate).toHaveBeenCalledWith('WELCOME', undefined);
    expect(result).toBe('Welcome to Super Fitness');
  });

  it('should pass interpolation params to TranslationService', () => {
    translationServiceMock.translate.mockReturnValue('Hello, Alex!');

    const params = { name: 'Alex' };
    const result = pipe.transform('GREETING', params);

    expect(translationServiceMock.translate).toHaveBeenCalledWith('GREETING', params);
    expect(result).toBe('Hello, Alex!');
  });
});
