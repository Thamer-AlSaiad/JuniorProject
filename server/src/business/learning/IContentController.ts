import { Request, Response, NextFunction } from 'express';
 
export interface IContentController {
  getRenderedContent(req: Request, res: Response, next: NextFunction): Promise<void>;
  getRawContent(req: Request, res: Response, next: NextFunction): Promise<void>;
} 