import { UpdateProfileDto, ChangePasswordDto, UserProfileResponseDto, MessageResponseDto } from '../../domain/dtos/UserDtos';

export interface IUserService {
  getUserProfile(userId: string): Promise<UserProfileResponseDto>;
  updateUserProfile(userId: string, data: UpdateProfileDto): Promise<UserProfileResponseDto>;
  changePassword(userId: string, data: ChangePasswordDto): Promise<MessageResponseDto>;
}
