import { User } from '../../domain/entities/User';
import { UserCreateDto, UserUpdateDto } from '../../domain/dtos/UserDtos';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByVerificationToken(token: string): Promise<User | null>;
  findByResetToken(token: string): Promise<User | null>;
  userExists(id: string): Promise<boolean>;
  create(data: UserCreateDto): Promise<User>;
  update(id: string, data: UserUpdateDto): Promise<User>;
  delete(id: string): Promise<User>;
}
