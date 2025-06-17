import bcrypt from 'bcryptjs';

class HashService {
  async hash(data: string): Promise<string> {
    return bcrypt.hash(data, 12);
  }
  
  async compare(data: string, hashedData: string): Promise<boolean> {
    return bcrypt.compare(data, hashedData);
  }
}

export default new HashService();