import { AuthService } from '../src/business/auth/authService';
import { IUserRepository } from '../src/data/repositories/IUserRepository';
import { ITokenService } from '../src/shared/services/ITokenService';
import { IEmailService } from '../src/shared/services/IEmailService';
import { IHashService } from '../src/shared/services/IHashService';
import { 
  RegisterDto, 
  LoginDto, 
  VerifyAccountDto, 
  ForgotPasswordDto, 
  ResetPasswordDto,
  ResendVerificationDto
} from '../src/domain/dtos/UserDtos';

const mockUserRepository = {
  findAll: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByVerificationToken: jest.fn(),
  findByResetToken: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  userExists: jest.fn()
} as jest.Mocked<IUserRepository>;

const mockTokenService = {
  generateToken: jest.fn(),
  verifyToken: jest.fn()
} as jest.Mocked<ITokenService>;

const mockEmailService = {
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn()
} as jest.Mocked<IEmailService>;

const mockHashService = {
  hash: jest.fn(),
  compare: jest.fn()
} as jest.Mocked<IHashService>;

const FIXED_DATE = new Date('2025-04-04');

describe('AuthService', () => {
  let authService: AuthService;
  let originalDate: DateConstructor;

  beforeEach(() => {
    jest.clearAllMocks();
    
    originalDate = global.Date;
    
    global.Date = jest.fn(() => FIXED_DATE) as any;
    global.Date.UTC = originalDate.UTC;
    global.Date.parse = originalDate.parse;
    global.Date.now = jest.fn(() => FIXED_DATE.getTime());
    
    authService = new AuthService(
      mockUserRepository,
      mockTokenService,
      mockEmailService,
      mockHashService
    );
  });

  afterEach(() => {
    global.Date = originalDate;
    jest.restoreAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      firstName: 'Thamer',
      lastName: 'AlSaiad',
      email: 'thameralsaiaddev@gmail.com',
      password: 'test1234'
    };

    // TEST CASE TVP-TC-08: Register New User
    it('should successfully register a new user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashed_password');
      mockUserRepository.create.mockResolvedValue({
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'hashed_password',
        isVerified: false,
        verificationToken: 'test-token',
        verificationTokenExpiry: FIXED_DATE
      });

      const result = await authService.register(registerDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('thameralsaiaddev@gmail.com');
      expect(mockHashService.hash).toHaveBeenCalledWith('test1234');
      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'hashed_password',
        verificationToken: expect.any(String),
        verificationTokenExpiry: FIXED_DATE
      }));
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        'thameralsaiaddev@gmail.com',
        expect.any(String)
      );
      expect(result).toEqual({
        message: 'User registered successfully. Please check your email to verify your account.'
      });
    });

    // TEST CASE TVP-TC-09: Register with Existing Email
    it('should throw an error if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'hashed_password',
        isVerified: true
      });

      await expect(authService.register(registerDto))
        .rejects.toThrow('Email already in use');
      
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('thameralsaiaddev@gmail.com');
      expect(mockHashService.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'thameralsaiaddev@gmail.com',
      password: 'test1234'
    };

    // TEST CASE TVP-TC-10: Login with Valid Credentials
    it('should successfully log in a verified user', async () => {
      // Setup
      const mockUser = {
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'hashed_password',
        isVerified: true
      };
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockHashService.compare.mockResolvedValue(true);
      mockTokenService.generateToken.mockReturnValue('jwt_token');

      // Execute
      const result = await authService.login(loginDto);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('thameralsaiaddev@gmail.com');
      expect(mockHashService.compare).toHaveBeenCalledWith('test1234', 'hashed_password');
      expect(mockTokenService.generateToken).toHaveBeenCalledWith({ id: '1' });
      
      expect(result).toEqual({
        token: 'jwt_token',
        user: {
          id: '1',
          firstName: 'Thamer',
          lastName: 'AlSaiad',
          email: 'thameralsaiaddev@gmail.com',
          isVerified: true
        }
      });
      expect(result.user).not.toHaveProperty('password');
    });

    // TEST CASE TVP-TC-11: Login with Non-existent Email
    it('should throw an error if user is not found', async () => {
      // Setup
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Execute & Assert
      await expect(authService.login(loginDto))
        .rejects.toThrow('Invalid email or password');
      
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('thameralsaiaddev@gmail.com');
      expect(mockHashService.compare).not.toHaveBeenCalled();
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
    });

    // TEST CASE TVP-TC-12: Login with Unverified Account
    it('should throw an error if user is not verified', async () => {
      // Setup
      const mockUser = {
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'hashed_password',
        isVerified: false
      };
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Execute & Assert
      await expect(authService.login(loginDto))
        .rejects.toThrow('Please verify your email before logging in');
      
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('thameralsaiaddev@gmail.com');
      expect(mockHashService.compare).not.toHaveBeenCalled();
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
    });

    // TEST CASE TVP-TC-13: Login with Incorrect Password
    it('should throw an error if password is incorrect', async () => {
      // Setup
      const mockUser = {
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'hashed_password',
        isVerified: true
      };
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockHashService.compare.mockResolvedValue(false);

      // Execute & Assert
      await expect(authService.login(loginDto))
        .rejects.toThrow('Invalid email or password');
      
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('thameralsaiaddev@gmail.com');
      expect(mockHashService.compare).toHaveBeenCalledWith('test1234', 'hashed_password');
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
    });
  });

  describe('verifyAccount', () => {
    const verifyDto: VerifyAccountDto = {
      token: 'valid-token'
    };

    // TEST CASE TVP-TC-14: Verify Account with Valid Token
    it('should successfully verify an account', async () => {
      // Setup
      const mockUser = {
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'hashed_password',
        isVerified: false,
        verificationToken: 'valid-token',
        verificationTokenExpiry: FIXED_DATE
      };
      
      mockUserRepository.findByVerificationToken.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({
        ...mockUser,
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      });

      // Execute
      const result = await authService.verifyAccount(verifyDto);

      // Assert
      expect(mockUserRepository.findByVerificationToken).toHaveBeenCalledWith('valid-token');
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      });
      
      expect(result).toEqual({
        message: 'Account verified successfully'
      });
    });

    // TEST CASE TVP-TC-15: Verify Account with Invalid Token
    it('should throw an error if verification token is invalid', async () => {
      // Setup
      mockUserRepository.findByVerificationToken.mockResolvedValue(null);

      // Execute & Assert
      await expect(authService.verifyAccount(verifyDto))
        .rejects.toThrow('Invalid or expired verification token');
      
      expect(mockUserRepository.findByVerificationToken).toHaveBeenCalledWith('valid-token');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    // TEST CASE TVP-TC-16: Verify Account with Expired Token
    it('should throw an error if verification token is expired', async () => {
      // Setup
      const expiredDate = new Date(FIXED_DATE);
      expiredDate.setDate(expiredDate.getDate() - 1); // Token expired 1 day ago
      
      const mockUser = {
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'hashed_password',
        isVerified: false,
        verificationToken: 'valid-token',
        verificationTokenExpiry: expiredDate, // Expired date
      };
      
      mockUserRepository.findByVerificationToken.mockResolvedValue(mockUser);

      // Execute & Assert
      await expect(authService.verifyAccount(verifyDto))
        .rejects.toThrow('Invalid or expired verification token');
      
      expect(mockUserRepository.findByVerificationToken).toHaveBeenCalledWith('valid-token');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('resendVerification', () => {
    const resendDto: ResendVerificationDto = {
      email: 'thameralsaiaddev@gmail.com'
    };

    // TEST CASE TVP-TC-17: Resend Verification Email
    it('should resend verification email to unverified user', async () => {
      // Setup
      const mockUser = {
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'hashed_password',
        isVerified: false
      };
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Execute
      const result = await authService.resendVerification(resendDto);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('thameralsaiaddev@gmail.com');
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', {
        verificationToken: expect.any(String),
        verificationTokenExpiry: FIXED_DATE
      });
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        'thameralsaiaddev@gmail.com',
        expect.any(String)
      );
      
      expect(result).toEqual({
        message: 'If an account with that email exists, a verification link has been sent'
      });
    });

    // TEST CASE TVP-TC-18: Resend Verification for Non-existent Email
    it('should not send verification email to non-existent user', async () => {
      // Setup
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Execute
      const result = await authService.resendVerification(resendDto);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('thameralsaiaddev@gmail.com');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
      
      expect(result).toEqual({
        message: 'If an account with that email exists, a verification link has been sent'
      });
    });

    // TEST CASE TVP-TC-19: Resend Verification for Already Verified Account
    it('should not send verification email to already verified user', async () => {
      // Setup
      const mockUser = {
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'hashed_password',
        isVerified: true
      };
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Execute
      const result = await authService.resendVerification(resendDto);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('thameralsaiaddev@gmail.com');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
      
      expect(result).toEqual({
        message: 'If an account with that email exists, a verification link has been sent'
      });
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'thameralsaiaddev@gmail.com'
    };

    // TEST CASE TVP-TC-20: Forgot Password Request
    it('should generate and send reset token for existing user', async () => {
      // Setup
      const mockUser = {
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'hashed_password',
        isVerified: true
      };
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Execute
      const result = await authService.forgotPassword(forgotPasswordDto);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('thameralsaiaddev@gmail.com');
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', {
        resetToken: expect.any(String),
        resetTokenExpiry: FIXED_DATE
      });
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'thameralsaiaddev@gmail.com',
        expect.any(String)
      );
      
      expect(result).toEqual({
        message: 'If an account with that email exists, we have sent a password reset link'
      });
    });

    // TEST CASE TVP-TC-21: Forgot Password for Non-existent Email
    it('should return generic success message for non-existent email', async () => {
      // Setup
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Execute
      const result = await authService.forgotPassword(forgotPasswordDto);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('thameralsaiaddev@gmail.com');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      
      expect(result).toEqual({
        message: 'If an account with that email exists, we have sent a password reset link'
      });
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'valid-reset-token',
      password: 'new-test1234'
    };

    // TEST CASE TVP-TC-22: Reset Password with Valid Token
    it('should successfully reset the password', async () => {
      // Setup
      const mockUser = {
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'old_hashed_password',
        isVerified: true,
        resetToken: 'valid-reset-token',
        resetTokenExpiry: FIXED_DATE
      };
      
      mockUserRepository.findByResetToken.mockResolvedValue(mockUser);
      mockHashService.hash.mockResolvedValue('new_hashed_password');

      // Execute
      const result = await authService.resetPassword(resetPasswordDto);

      // Assert
      expect(mockUserRepository.findByResetToken).toHaveBeenCalledWith('valid-reset-token');
      expect(mockHashService.hash).toHaveBeenCalledWith('new-test1234');
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', {
        password: 'new_hashed_password',
        resetToken: null,
        resetTokenExpiry: null
      });
      
      expect(result).toEqual({
        message: 'Password reset successfully'
      });
    });

    // TEST CASE TVP-TC-23: Reset Password with Invalid Token
    it('should throw an error if reset token is invalid', async () => {
      // Setup
      mockUserRepository.findByResetToken.mockResolvedValue(null);

      // Execute & Assert
      await expect(authService.resetPassword(resetPasswordDto))
        .rejects.toThrow('Invalid or expired reset token');
      
      expect(mockUserRepository.findByResetToken).toHaveBeenCalledWith('valid-reset-token');
      expect(mockHashService.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    // TEST CASE TVP-TC-24: Reset Password with Expired Token
    it('should throw an error if reset token is expired', async () => {
      // Setup
      const expiredDate = new Date(FIXED_DATE);
      expiredDate.setDate(expiredDate.getDate() - 1); // Token expired 1 day ago
      
      const mockUser = {
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'old_hashed_password',
        isVerified: true,
        resetToken: 'valid-reset-token',
        resetTokenExpiry: expiredDate // Expired date
      };
      
      mockUserRepository.findByResetToken.mockResolvedValue(mockUser);

      // Execute & Assert
      await expect(authService.resetPassword(resetPasswordDto))
        .rejects.toThrow('Invalid or expired reset token');
      
      expect(mockUserRepository.findByResetToken).toHaveBeenCalledWith('valid-reset-token');
      expect(mockHashService.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    // TEST CASE TVP-TC-25: Get Current User Profile
    it('should return the current user without password', async () => {
      // Setup
      const mockUser = {
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'hashed_password',
        isVerified: true
      };
      
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Execute
      const result = await authService.getCurrentUser('1');

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        isVerified: true
      });
      expect(result).not.toHaveProperty('password');
    });

    // TEST CASE TVP-TC-26: Get Current User with Invalid ID
    it('should throw an error if user is not found', async () => {
      // Setup
      mockUserRepository.findById.mockResolvedValue(null);

      // Execute & Assert
      await expect(authService.getCurrentUser('1'))
        .rejects.toThrow('User not found');
      
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
    });
  });
});