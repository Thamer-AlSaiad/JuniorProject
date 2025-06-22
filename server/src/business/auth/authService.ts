// src/business/auth/authService.ts
import crypto from 'crypto';
import ApiError from '../../shared/utils/ApiError';
import { IUserRepository } from '../../data/repositories/IUserRepository';
import { ITokenService } from '../../shared/services/ITokenService';
import { IEmailService } from '../../shared/services/IEmailService';
import { IHashService } from '../../shared/services/IHashService';
import { IAuthService } from './IAuthService';
import {
  RegisterDto,
  LoginDto,
  VerifyAccountDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseDto,
  ResendVerificationDto
} from '../../domain/dtos/UserDtos';
import { AuthenticatedUser, PublicUser } from '../../domain/entities/User';

export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private tokenService: ITokenService;
  private emailService: IEmailService;
  private hashService: IHashService;

  constructor(
    userRepository: IUserRepository,
    tokenService: ITokenService,
    emailService: IEmailService,
    hashService: IHashService
  ) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.emailService = emailService;
    this.hashService = hashService;
  }

  async register(data: RegisterDto): Promise<{ message: string }> {
    const { firstName, lastName, email, password } = data;
    
    const existingUser = await this.userRepository.findByEmail(email);
    
    if (existingUser) {
      throw ApiError.badRequest('Email already in use');
    }
    
    const hashedPassword = await this.hashService.hash(password);
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() +  1 * 60 * 60 * 1000); // 1 hours
    
    const user = await this.userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiry
    });
    
    await this.emailService.sendVerificationEmail(user.email, verificationToken);
    
    return {
      message: 'User registered successfully. Please check your email to verify your account.'
    };
  }

  async verifyAccount(data: VerifyAccountDto): Promise<AuthResponseDto> {
    const { token } = data;
    
    const user = await this.userRepository.findByVerificationToken(token);
    
    if (!user) {
      throw ApiError.badRequest('Invalid or expired verification token');
    }
    
    await this.userRepository.update(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null
    });
    

    const authToken = this.tokenService.generateToken({ id: user.id });
    

    const { password: _, ...userWithoutPassword } = user;
    
    return {
      token: authToken,
      user: userWithoutPassword as any
    };
  }
  
  async login(data: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = data;
    
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    
    if (!user.isVerified) {
      throw ApiError.unauthorized('Please verify your email before logging in');
    }
    
    const isPasswordValid = await this.hashService.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    
    const token = this.tokenService.generateToken({ id: user.id });
    
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      token,
      user: userWithoutPassword as any
    };
  }
  
  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = data;
    
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      return {
        message: 'If an account with that email exists, we have sent a password reset link'
      };
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    
    await this.userRepository.update(user.id, {
      resetToken,
      resetTokenExpiry
    });
    
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    
    return {
      message: 'If an account with that email exists, we have sent a password reset link'
    };
  }
  


  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    const { token, password } = data;
    
    const user = await this.userRepository.findByResetToken(token);
    
    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }
    
    const hashedPassword = await this.hashService.hash(password);
    
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null 
    });
    
    return {
      message: 'Password reset successfully'
    };
  }
  
  async getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    const { password, verificationToken, resetToken, ...publicUser } = user;
    
    return publicUser;
  }

  async resendVerification(data: ResendVerificationDto): Promise<{ message: string }> {
    const { email } = data;
    
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      return {
        message: 'If an account with that email exists, a verification link has been sent'
      };
    }
    
    if (user.isVerified) {
      return {
        message: 'If an account with that email exists, a verification link has been sent'
      };
    }
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() +  1 * 60 * 60 * 1000); 
    
    await this.userRepository.update(user.id, {
      verificationToken,
      verificationTokenExpiry
    });
    
    await this.emailService.sendVerificationEmail(user.email, verificationToken);
    
    return {
      message: 'If an account with that email exists, a verification link has been sent'
    };
  }
}