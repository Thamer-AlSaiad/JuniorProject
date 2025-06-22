import { Request, Response, NextFunction } from 'express';

export interface ICurriculumController {
  getPaths(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPath(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSectionsByPath(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSection(req: Request, res: Response, next: NextFunction): Promise<void>;
} 