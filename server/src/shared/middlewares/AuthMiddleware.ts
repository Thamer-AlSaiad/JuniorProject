import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface TokenPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const PUBLIC_ENDPOINTS = [
  '/auth/register',
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-account',
  '/auth/resend-verification'
];

const PUBLIC_GET_ENDPOINTS = [
  '/curriculum/paths',
  '/curriculum/courses',
  '/curriculum/sections',
  '/curriculum/lessons'
];

export const AuthMiddleware = {
  isPublicRoute(path: string, method: string): boolean {
    if (PUBLIC_ENDPOINTS.some(endpoint => path.includes(endpoint) || path.startsWith(endpoint))) {
      return true;
    }
    
    if (method === 'GET' && 
        PUBLIC_GET_ENDPOINTS.some(endpoint => path.includes(endpoint) || path.startsWith(endpoint)) &&
        !path.includes('/progress')) {
      return true;
    }
    
    return false;
  },
  
  extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization || '';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    return token || null;
  },
  
  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  },

  protect(req: Request, res: Response, next: NextFunction): void {

    if (AuthMiddleware.isPublicRoute(req.path, req.method)) {
      next();
      return;
    }

    const token = AuthMiddleware.extractToken(req);
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }
    
    const decoded = AuthMiddleware.verifyToken(token);
    
    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
      return;
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      res.status(401).json({
        success: false,
        error: 'Token expired'
      });
      return;
    }
    
    req.user = { id: decoded.id };
    next();
  },
  
  optional(req: Request, res: Response, next: NextFunction): void {
    const token = AuthMiddleware.extractToken(req);
    
    if (token) {
      const decoded = AuthMiddleware.verifyToken(token);
      if (decoded) {
        req.user = { id: decoded.id };
      }
    }
    
    next();
  }
};

export const authMiddleware: RequestHandler = AuthMiddleware.protect; 