export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PublicUser = Omit<User, 'password' | 'verificationToken' | 'resetToken'>;

export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
}