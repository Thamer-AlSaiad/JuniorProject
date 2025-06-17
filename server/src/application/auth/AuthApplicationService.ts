import { IAuthService } from '../../business/auth/IAuthService';
import { 
  RegisterDto, 
  LoginDto, 
  VerifyAccountDto, 
  ForgotPasswordDto, 
  ResetPasswordDto, 
  ResendVerificationDto,
  AuthResponseDto,
  MessageResponseDto
} from '../../domain/dtos/UserDtos';
import { PublicUser } from '../../domain/entities/User';

export class AuthApplicationService {
  constructor(private readonly authService: IAuthService) {}

  async register(data: RegisterDto): Promise<MessageResponseDto> {
    return await this.authService.register(data);
  }

  async verifyAccount(data: VerifyAccountDto): Promise<AuthResponseDto> {
    return await this.authService.verifyAccount(data);
  }

  async login(data: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.login(data);
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<MessageResponseDto> {
    return await this.authService.forgotPassword(data);
  }

  async resetPassword(data: ResetPasswordDto): Promise<MessageResponseDto> {
    return await this.authService.resetPassword(data);
  }

  async resendVerification(data: ResendVerificationDto): Promise<MessageResponseDto> {
    return await this.authService.resendVerification(data);
  }

  async getCurrentUser(userId: string): Promise<PublicUser> {
    return await this.authService.getCurrentUser(userId);
  }
}