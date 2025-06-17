// src/business/user/userService.ts
import ApiError from '../../shared/utils/ApiError';
import { IUserRepository } from '../../data/repositories/IUserRepository';
import { IHashService } from '../../shared/services/IHashService';
import { IUserService } from './IUserService';
import { UpdateProfileDto, ChangePasswordDto, UserProfileResponseDto, MessageResponseDto } from '../../domain/dtos/UserDtos';

export class UserService implements IUserService {
  private userRepository: IUserRepository;
  private hashService: IHashService;

  constructor(
    userRepository: IUserRepository,
    hashService: IHashService
  ) {
    this.userRepository = userRepository;
    this.hashService = hashService;
  }

  async getUserProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    const { password, verificationToken, resetToken, verificationTokenExpiry, resetTokenExpiry, ...userProfile } = user;
    
    return userProfile;
  }
  
  async updateUserProfile(userId: string, data: UpdateProfileDto): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    const updatedUser = await this.userRepository.update(userId, data);
    
    const { password, verificationToken, resetToken, verificationTokenExpiry, resetTokenExpiry, ...userProfile } = updatedUser;
    
    return userProfile;
  }
  
  async changePassword(userId: string, data: ChangePasswordDto): Promise<MessageResponseDto> {
    const { currentPassword, newPassword } = data;
    
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    const isPasswordValid = await this.hashService.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    const hashedPassword = await this.hashService.hash(newPassword);
    await this.userRepository.update(userId, {
      password: hashedPassword
    });
    
    return {
      message: 'Password updated successfully'
    };
  }
}