import { Request, Response, NextFunction } from 'express';

export interface IAuthMiddleware {
  protect(req: Request, res: Response, next: NextFunction): Promise<void>;
}
