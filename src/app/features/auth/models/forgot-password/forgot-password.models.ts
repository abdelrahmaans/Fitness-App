export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  info?: string;
}

export interface VerifyResetCodeRequest {
  resetCode: string;
}

export interface VerifyResetCodeResponse {
  status: string;
  message?: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  token?: string;
  message?: string;
}

export interface PasswordRecoveryState {
  email: string | null;
  resetCode: string | null;
  isCodeVerified: boolean;
}
