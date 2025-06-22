import { Request, Response, NextFunction } from 'express';
 
export interface IContentController {
  getRawContent(req: Request, res: Response, next: NextFunction): Promise<void>;
} 