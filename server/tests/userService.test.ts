import { UserService } from '../src/business/user/userService';
import { IUserRepository } from '../src/data/repositories/IUserRepository';
import { IHashService } from '../src/shared/services/IHashService';
import { UpdateProfileDto, ChangePasswordDto } from '../src/domain/dtos/UserDtos';

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

const mockHashService = {
  hash: jest.fn(),
  compare: jest.fn()
} as jest.Mocked<IHashService>;

const FIXED_DATE = new Date('2025-04-04');

describe('UserService', () => {
  let userService: UserService;
  let originalDate: DateConstructor;

  beforeEach(() => {
    jest.clearAllMocks();
    
    originalDate = global.Date;
    
    global.Date = jest.fn(() => FIXED_DATE) as any;
    global.Date.UTC = originalDate.UTC;
    global.Date.parse = originalDate.parse;
    global.Date.now = jest.fn(() => FIXED_DATE.getTime());
    
    userService = new UserService(
      mockUserRepository,
      mockHashService
    );
  });

  afterEach(() => {
    global.Date = originalDate;
    jest.restoreAllMocks();
  });

  describe('getUserProfile', () => {
    // TEST CASE TVP-TC-01: Get User Profile with Valid ID
    it('should return the user profile without password', async () => {
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
      const result = await userService.getUserProfile('1');

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

    // TEST CASE TVP-TC-02: Get User Profile with Invalid ID
    it('should throw an error if user is not found', async () => {
      // Setup
      mockUserRepository.findById.mockResolvedValue(null);

      // Execute & Assert
      await expect(userService.getUserProfile('1'))
        .rejects.toThrow('User not found');
      
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('updateUserProfile', () => {
    const updateDto: UpdateProfileDto = {
      firstName: 'Updated',
      lastName: 'AlSaiad'
    };

    // TEST CASE TVP-TC-03: Update User Profile with Valid Data
    it('should update and return the user profile', async () => {
      // Setup
      const mockUser = {
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'hashed_password',
        isVerified: true
      };
      
      const updatedMockUser = {
        ...mockUser,
        firstName: 'Updated',
        lastName: 'AlSaiad'
      };
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(updatedMockUser);

      // Execute
      const result = await userService.updateUserProfile('1', updateDto);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', updateDto);
      expect(result).toEqual({
        id: '1',
        firstName: 'Updated',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        isVerified: true
      });
      expect(result).not.toHaveProperty('password');
    });

    // TEST CASE TVP-TC-04: Update User Profile with Invalid ID
    it('should throw an error if user is not found', async () => {
      // Setup
      mockUserRepository.findById.mockResolvedValue(null);

      // Execute & Assert
      await expect(userService.updateUserProfile('1', updateDto))
        .rejects.toThrow('User not found');
      
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'test1234',
      newPassword: 'newTest1234'
    };

    // TEST CASE TVP-TC-05: Change Password with Valid Credentials
    it('should successfully change the password', async () => {
      // Setup
      const mockUser = {
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'hashed_current_password',
        isVerified: true
      };
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockHashService.compare.mockResolvedValue(true);
      mockHashService.hash.mockResolvedValue('hashed_new_password');

      // Execute
      const result = await userService.changePassword('1', changePasswordDto);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(mockHashService.compare).toHaveBeenCalledWith(
        'test1234', 
        'hashed_current_password'
      );
      expect(mockHashService.hash).toHaveBeenCalledWith('newTest1234');
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', {
        password: 'hashed_new_password'
      });
      
      expect(result).toEqual({
        message: 'Password updated successfully'
      });
    });

    // TEST CASE TVP-TC-06: Change Password with Invalid User ID
    it('should throw an error if user is not found', async () => {
      // Setup
      mockUserRepository.findById.mockResolvedValue(null);

      // Execute & Assert
      await expect(userService.changePassword('1', changePasswordDto))
        .rejects.toThrow('User not found');
      
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(mockHashService.compare).not.toHaveBeenCalled();
      expect(mockHashService.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    // TEST CASE TVP-TC-07: Change Password with Incorrect Current Password
    it('should throw an error if current password is incorrect', async () => {
      // Setup
      const mockUser = {
        id: '1',
        firstName: 'Thamer',
        lastName: 'AlSaiad',
        email: 'thameralsaiaddev@gmail.com',
        password: 'hashed_current_password',
        isVerified: true
      };
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockHashService.compare.mockResolvedValue(false);

      // Execute & Assert
      await expect(userService.changePassword('1', changePasswordDto))
        .rejects.toThrow('Current password is incorrect');
      
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(mockHashService.compare).toHaveBeenCalledWith(
        'test1234', 
        'hashed_current_password'
      );
      expect(mockHashService.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });
});