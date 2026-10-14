import { Component, input } from '@angular/core';
import {
  AUTH_HEADING_STEP_RING,
  AUTH_HEADING_STEP_RING_TRANSFORM,
  type AuthHeadingStepProgress,
} from '../../utils/auth-heading-step';

@Component({
  selector: 'app-auth-heading-step',
  templateUrl: './auth-heading-step.html',
  styleUrl: './auth-heading-step.scss',
})
export class AuthHeadingStep {
  readonly progress = input.required<AuthHeadingStepProgress>();

  protected readonly ring = AUTH_HEADING_STEP_RING;
  protected readonly ringTransform = AUTH_HEADING_STEP_RING_TRANSFORM;
}
