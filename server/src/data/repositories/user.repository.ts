import UserModel from '../mongodb/models/userModel';
import type { IUser } from '../mongodb/models/userModel';
import { IUserRepository } from './IUserRepository';
import { User } from '../../domain/entities/User';
import { UserCreateDto, UserUpdateDto } from '../../domain/dtos/UserDtos';

export class UserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    const users = await UserModel.find();
    return users.map((user: IUser) => this.mapToUser(user));
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? this.mapToUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? this.mapToUser(user) : null;
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const user = await UserModel.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    });
    return user ? this.mapToUser(user) : null;
  }

  async findByResetToken(token: string): Promise<User | null> {
    const user = await UserModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });
    return user ? this.mapToUser(user) : null;
  }

  async create(data: UserCreateDto): Promise<User> {
    const user = await UserModel.create(data);
    return this.mapToUser(user);
  }

  async update(id: string, data: UserUpdateDto): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(id, data, { new: true });
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return this.mapToUser(user);
  }

  async delete(id: string): Promise<User> {
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return this.mapToUser(user);
  }

  async userExists(id: string): Promise<boolean> {
    try {
      const count = await UserModel.countDocuments({ _id: id });
      return count > 0;
    } catch (error) {
      return false;
    }
  }

  private mapToUser(doc: any): User {
    return {
      id: doc._id.toString(),
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      password: doc.password,
      isVerified: doc.isVerified,
      verificationToken: doc.verificationToken,
      verificationTokenExpiry: doc.verificationTokenExpiry,
      resetToken: doc.resetToken,
      resetTokenExpiry: doc.resetTokenExpiry
    };
  }
}

