export interface AuthUser {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  photo?: string;
  role?: string;
  gender?: string;
  age?: number;
  weight?: number;
  height?: number;
  activityLevel?: string;
  goal?: string;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  token?: string;
  accessToken?: string;
  user?: AuthUser;
}

export interface RegisterFormRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rePassword: string;
  gender?: string;
  age?: number;
  weight?: number;
  height?: number;
  activityLevel?: string;
  goal?: string;
}

export interface RegisterFormResponse {
  message: string;
  token: string;
  user: AuthUser;
}

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

export interface ApiErrorBody {
  error?: string;
  message?: string;
}
