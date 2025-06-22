import {
  RegisterDto,
  LoginDto,
  VerifyAccountDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseDto,
  MessageResponseDto
} from '../../domain/dtos/UserDtos';
import { PublicUser } from '../../domain/entities/User';

export interface IAuthService {
  register(data: RegisterDto): Promise<MessageResponseDto>;
  verifyAccount(data: VerifyAccountDto): Promise<AuthResponseDto>;
  resendVerification(data: ResendVerificationDto): Promise<MessageResponseDto>;
  login(data: LoginDto): Promise<AuthResponseDto>;
  forgotPassword(data: ForgotPasswordDto): Promise<MessageResponseDto>;
  resetPassword(data: ResetPasswordDto): Promise<MessageResponseDto>;
  getCurrentUser(userId: string): Promise<PublicUser>;
}
