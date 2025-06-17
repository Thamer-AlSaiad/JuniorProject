import { IUserService } from '../../business/user/IUserService';
import { 
  UpdateProfileDto, 
  ChangePasswordDto, 
  UserProfileResponseDto,
  MessageResponseDto
} from '../../domain/dtos/UserDtos';

export class UserApplicationService {
  constructor(private readonly userService: IUserService) {}

  async getUserProfile(userId: string): Promise<UserProfileResponseDto> {
    return await this.userService.getUserProfile(userId);
  }

  async updateUserProfile(userId: string, data: UpdateProfileDto): Promise<UserProfileResponseDto> {
    return await this.userService.updateUserProfile(userId, data);
  }

  async changePassword(userId: string, data: ChangePasswordDto): Promise<MessageResponseDto> {
    return await this.userService.changePassword(userId, data);
  }
}