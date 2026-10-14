import { AUTH_HEADING_STEP_RING, resolveAuthHeadingStep } from './auth-heading-step';

describe('resolveAuthHeadingStep', () => {
  const circumference = 2 * Math.PI * AUTH_HEADING_STEP_RING.radius;

  it('parses valid labels and handles invalid ones', () => {
    expect(resolveAuthHeadingStep('2/6').display).toBe('2/6');
    expect(resolveAuthHeadingStep('(3/6)').current).toBe(3);
    expect(resolveAuthHeadingStep('nope').showRing).toBe(false);
  });

  it('hides ring on first step', () => {
    const progress = resolveAuthHeadingStep('1/6');
    expect(progress.showRing).toBe(false);
    expect(progress.ariaLabel).toBe('Step 1 of 6');
  });

  it('grows ring from step 2 to a full circle on the last step', () => {
    const step2 = resolveAuthHeadingStep('2/6');
    const step6 = resolveAuthHeadingStep('6/6');

    const step2Filled = Number(step2.ringDasharray!.split(' ')[0]);
    const step6Filled = Number(step6.ringDasharray!.split(' ')[0]);

    expect(step2Filled).toBeCloseTo(circumference / 6, 4);
    expect(step6Filled).toBeCloseTo(circumference, 4);
  });
});
