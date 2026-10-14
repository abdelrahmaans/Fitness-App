import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AuthRadioButton, RadioOption } from './auth-radio-button';

describe('AuthRadioButton', () => {
  let component: AuthRadioButton<unknown>;
  let fixture: ComponentFixture<AuthRadioButton<unknown>>;

  const mockOptions: RadioOption<string>[] = [
    { id: '1', label: 'Rookie', value: 'rookie' },
    { id: '2', label: 'Beginner', value: 'beginner' },
    { id: '3', label: 'Intermediate', value: 'intermediate' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthRadioButton],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthRadioButton);
    component = fixture.componentInstance;
    
    // Set required signal inputs
    fixture.componentRef.setInput('options', mockOptions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the correct number of options', () => {
    const labels = fixture.debugElement.queryAll(By.css('label'));
    expect(labels.length).toBe(3);
  });

  it('should render correct option labels', () => {
    const spanElements = fixture.debugElement.queryAll(By.css('span.font-medium'));
    expect(spanElements[0].nativeElement.textContent.trim()).toBe('Rookie');
    expect(spanElements[1].nativeElement.textContent.trim()).toBe('Beginner');
    expect(spanElements[2].nativeElement.textContent.trim()).toBe('Intermediate');
  });

  it('should set the model value when selectOption is called', () => {
    component.selectOption('beginner');
    expect(component.value()).toBe('beginner');
  });

  it('should update the model value when the radio input is changed', () => {
    const inputs = fixture.debugElement.queryAll(By.css('input[type="radio"]'));
    
    // Simulate user selecting the second option
    inputs[1].triggerEventHandler('change', null);
    fixture.detectChanges();
    
    expect(component.value()).toBe('beginner');
  });

  it('should apply active orange classes to the selected option', () => {
    // Set initial value
    fixture.componentRef.setInput('value', 'rookie');
    fixture.detectChanges();
    
    const labels = fixture.debugElement.queryAll(By.css('label'));
    
    // First option should have active classes
    expect(labels[0].classes['border-orange-500']).toBe(true);
    expect(labels[0].classes['text-orange-500']).toBe(true);
    
    // Second option should have inactive classes
    expect(labels[1].classes['border-white/15']).toBe(true);
    expect(labels[1].classes['text-gray-300']).toBe(true);
  });

  it('should render the inner dot indicator only for the selected option', () => {
    fixture.componentRef.setInput('value', 'intermediate');
    fixture.detectChanges();

    const dots = fixture.debugElement.queryAll(By.css('div.bg-orange-500'));
    
    // Only one active dot should be rendered
    expect(dots.length).toBe(1);
    
    // The dot should be inside the third option
    const labels = fixture.debugElement.queryAll(By.css('label'));
    const thirdOptionDot = labels[2].query(By.css('div.bg-orange-500'));
    expect(thirdOptionDot).toBeTruthy();
  });
});
