import { AuthenticatedUser } from '../entities/User';

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface VerifyAccountDto {
  token: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface AuthResponseDto {
  user: AuthenticatedUser;
  token: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserCreateDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified?: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
}

export interface UserUpdateDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  isVerified?: boolean;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
}

export interface UserProfileResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MessageResponseDto {
  message: string;
}