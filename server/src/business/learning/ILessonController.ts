import { Request, Response, NextFunction } from 'express';

export interface ILessonController {
  getLessonsBySection(req: Request, res: Response, next: NextFunction): Promise<void>;
  getLesson(req: Request, res: Response, next: NextFunction): Promise<void>;
  getLessonContent(req: Request, res: Response, next: NextFunction): Promise<void>;
  markLessonAsCompleted(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserLessonProgress(req: Request, res: Response, next: NextFunction): Promise<void>;
} 