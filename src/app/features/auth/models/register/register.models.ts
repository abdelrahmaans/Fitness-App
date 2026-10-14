export interface RegisterFormRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rePassword: string;
}

export interface RegisterFormUser {
  firstName: string;
  lastName: string;
  email: string;
  _id: string;
  createdAt: string;
  gender?: string;
  age?: number;
  weight?: number;
  height?: number;
  activityLevel?: string;
  goal?: string;
  photo?: string;
}

export interface RegisterFormResponse {
  message: string;
  user: RegisterFormUser;
  token: string;
}

export interface SignupDraft extends Partial<RegisterFormRequest> {
  gender?: 'male' | 'female';
  age?: number;
  weight?: number;
  height?: number;
  activityLevel?: string;
  goal?: string;
  photo?: string;
}
