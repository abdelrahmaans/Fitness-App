export const AUTH_HEADING_STEP_RING = {
  size: 64,
  radius: 31,
  startDeg: 150,
  strokeWidth: 2,
} as const;

export const AUTH_HEADING_STEP_RING_TRANSFORM = `rotate(${AUTH_HEADING_STEP_RING.startDeg}deg)`;

const RING_CIRCUMFERENCE = 2 * Math.PI * AUTH_HEADING_STEP_RING.radius;
const STEP_LABEL = /^\(?\s*(\d+)\s*\/\s*(\d+)\s*\)?$/;

export type AuthHeadingStepProgress = {
  display: string;
  current: number;
  total: number;
  showRing: boolean;
  ringDasharray: string | null;
  ariaLabel: string;
};

function stepAriaLabel(current: number, total: number, display: string): string {
  return current > 0 && total > 0 ? `Step ${current} of ${total}` : `Step ${display}`;
}

function invalidStep(display: string): AuthHeadingStepProgress {
  return {
    display,
    current: 0,
    total: 0,
    showRing: false,
    ringDasharray: null,
    ariaLabel: stepAriaLabel(0, 0, display),
  };
}

export function resolveAuthHeadingStep(stepLabel: string): AuthHeadingStepProgress {
  const match = stepLabel.trim().match(STEP_LABEL);
  if (!match) {
    return invalidStep(stepLabel.trim());
  }

  const current = Number(match[1]);
  const total = Number(match[2]);
  if (current < 1 || total < 1 || current > total) {
    return invalidStep(stepLabel.trim());
  }

  const display = `${current}/${total}`;

  if (current <= 1) {
    return {
      display,
      current,
      total,
      showRing: false,
      ringDasharray: null,
      ariaLabel: stepAriaLabel(current, total, display),
    };
  }

  const progress = current >= total ? 1 : (current - 1) / total;
  const filled = progress * RING_CIRCUMFERENCE;

  return {
    display,
    current,
    total,
    showRing: true,
    ringDasharray: `${filled} ${RING_CIRCUMFERENCE}`,
    ariaLabel: stepAriaLabel(current, total, display),
  };
}
