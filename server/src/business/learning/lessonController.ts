import { Request, Response, NextFunction } from 'express';
import { ILessonController } from './ILessonController';
import { mapToDTO, cleanLessonDTO } from '../../shared/utils/dtoUtils';

export class LessonController implements ILessonController {
  constructor(
    private lessonService: any,
    private contentService: any
  ) {}

  getLessonsBySection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sectionId } = req.params;
      
      if (!sectionId) {
        res.status(400).json({
          success: false,
          error: 'Section ID is required'
        });
        return;
      }
      
      const lessons = await this.lessonService.getLessonsBySection(sectionId);
      
      const cleanLessons = mapToDTO(lessons, cleanLessonDTO);
      
      res.status(200).json({
        success: true,
        count: cleanLessons.length,
        data: cleanLessons
      });
    } catch (error) {
      next(error);
    }
  };

  getLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { identifier } = req.params;
      const { sectionId } = req.query;
      const isRawContent = req.query.raw === 'true';
      
      const lesson = await this.lessonService.getLesson(
        identifier, 
        sectionId as string | undefined
      );
      
      if (!lesson) {
        res.status(404).json({
          success: false,
          error: 'Lesson not found'
        });
        return;
      }
      
      if (isRawContent) {
        try {
          const rawContent = await this.contentService.getRawContent(lesson._id);

          const lessonWithRawContent = {
            ...cleanLessonDTO(lesson),
            content: rawContent.content,
            contentFormat: rawContent.format
          };
          
          res.status(200).json({
            success: true,
            data: lessonWithRawContent
          });
          return;
        } catch (rawError) {
          console.error('Error getting raw content:', rawError);
        }
      }
      
      const cleanLesson = cleanLessonDTO(lesson);
      
      res.status(200).json({
        success: true,
        data: cleanLesson
      });
    } catch (error) {
      next(error);
    }
  };

  markLessonAsCompleted = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lessonId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }
      
      await this.lessonService.markLessonCompleted(lessonId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Lesson marked as completed'
      });
    } catch (error) {
      next(error);
    }
  };

  getUserLessonProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }
      
      const progress = await this.lessonService.getUserProgress(userId);
      
      res.status(200).json({
        success: true,
        data: progress
      });
    } catch (error) {
      next(error);
    }
  };
} 