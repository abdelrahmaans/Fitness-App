import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RecommendationForYou } from './recommendation-for-you';

describe('RecommendationForYou', () => {
  let component: RecommendationForYou;
  let fixture: ComponentFixture<RecommendationForYou>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendationForYou],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RecommendationForYou);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty cards', () => {
    expect(component.cards()).toEqual([]);
  });

  it('should show at most 3 visible cards', () => {
    component.cards.set([
      { id: '1', titleKey: 'A', image: '/a.webp', alt: 'A' },
      { id: '2', titleKey: 'B', image: '/b.webp', alt: 'B' },
      { id: '3', titleKey: 'C', image: '/c.webp', alt: 'C' },
      { id: '4', titleKey: 'D', image: '/d.webp', alt: 'D' },
    ]);
    expect(component.visibleCards().length).toBe(3);
  });

  it('should render the section heading', () => {
    fixture.detectChanges();
    const heading = fixture.nativeElement.querySelector('.recommendation__heading');
    expect(heading).toBeTruthy();
  });
});
