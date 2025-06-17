import { Request, Response, NextFunction } from 'express';
import { IContentController } from './IContentController';

export class ContentController implements IContentController {
  constructor(
    private contentService: any
  ) {}

  getRenderedContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lessonId } = req.params;
      
      const renderedContent = await this.contentService.getRenderedContent(lessonId);
      
      res.status(200).json({
        success: true,
        data: renderedContent
      });
    } catch (error) {
      // Check if lesson not found error
      if ((error as Error).message.includes('Lesson not found')) {
        res.status(404).json({
          success: false,
          error: 'Lesson not found'
        });
        return;
      }
      
      next(error);
    }
  };

  getRawContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lessonId } = req.params;
      
      const rawContent = await this.contentService.getRawContent(lessonId);
      
      res.status(200).json({
        success: true,
        data: rawContent
      });
    } catch (error) {
      if ((error as Error).message.includes('Lesson not found')) {
        res.status(404).json({
          success: false,
          error: 'Lesson not found'
        });
        return;
      }
      
      next(error);
    }
  };
} 