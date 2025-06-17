import jwt from 'jsonwebtoken';

class TokenService {
  generateToken(payload: any): string {
    const secret = process.env.JWT_SECRET ;
    
    return (jwt as any).sign(payload, secret, {
      expiresIn: '1d'
    });
  }
  
  verifyToken(token: string): any {
    const secret = process.env.JWT_SECRET ;
    
    return (jwt as any).verify(token, secret);
  }
}

export default new TokenService();