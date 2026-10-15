import type { AuthUser } from '../../../core/models/auth.models';
import type { RadioOption } from '../../../shared/ui/auth-radio-button/auth-radio-button';

export interface EditProfileRequest {
  goal?: string;
  activityLevel?: string;
  weight?: number;
  height?: number;
  age?: number;
  firstName?: string;
  lastName?: string;
}

export interface EditProfileResponse {
  message: string;
  user: AuthUser;
}

export interface ProfileDataResponse {
  message: string;
  user: AuthUser;
}

export type BasicMetricType = 'goal' | 'level' | 'weight';

export interface MetricCardConfig {
  type: BasicMetricType;
  titleKey: string;
  helperKey: string;
  displayValue: string;
  ariaLabel: string;
}

export const GOAL_OPTIONS: readonly { id: string; labelKey: string; value: string }[] = [
  { id: '1', labelKey: 'ACCOUNT.GOALS.GAIN_WEIGHT', value: 'Gain Weight' },
  { id: '2', labelKey: 'ACCOUNT.GOALS.LOSE_WEIGHT', value: 'Lose Weight' },
  { id: '3', labelKey: 'ACCOUNT.GOALS.GET_FITTER', value: 'Get Fitter' },
  { id: '4', labelKey: 'ACCOUNT.GOALS.GAIN_FLEXIBLE', value: 'Gain More Flexible' },
  { id: '5', labelKey: 'ACCOUNT.GOALS.LEARN_BASIC', value: 'Learn The Basic' },
];

export const ACTIVITY_LEVEL_OPTIONS: readonly { id: string; labelKey: string; value: string; displayLabel: string }[] = [
  { id: '1', labelKey: 'ACCOUNT.LEVELS.ROOKIE', value: 'level1', displayLabel: 'Rookie' },
  { id: '2', labelKey: 'ACCOUNT.LEVELS.BEGINNER', value: 'level2', displayLabel: 'Beginner' },
  { id: '3', labelKey: 'ACCOUNT.LEVELS.INTERMEDIATE', value: 'level3', displayLabel: 'Intermediate' },
  { id: '4', labelKey: 'ACCOUNT.LEVELS.ADVANCE', value: 'level4', displayLabel: 'Advance' },
  { id: '5', labelKey: 'ACCOUNT.LEVELS.TRUE_BEAST', value: 'level5', displayLabel: 'True Beast' },
];
