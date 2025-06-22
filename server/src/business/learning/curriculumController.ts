import { Request, Response, NextFunction } from 'express';
import { ICurriculumController } from './ICurriculumController';

export class CurriculumController implements ICurriculumController {
  constructor(
    private curriculumService: any
  ) {}

  getPaths = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paths = await this.curriculumService.getPaths();
      
      const cleanPaths = paths.map((path: any) => ({
        id: path._id.toString(),
        title: path.title,
        description: path.description,
        slug: path.slug,
        imageUrl: path.imageUrl,
        difficulty: path.difficulty,
        sectionCount: path.sectionCount || 0
      }));
      
      res.status(200).json({
        success: true,
        count: cleanPaths.length,
        data: cleanPaths
      });
    } catch (error) {
      next(error);
    }
  };

  getPath = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { identifier } = req.params;
      const path = await this.curriculumService.getPath(identifier);
      
      if (!path) {
        res.status(404).json({
          success: false,
          error: 'Path not found'
        });
        return;
      }
      
      const cleanPath = {
        _id: path._id.toString(),
        id: path._id.toString(),
        title: path.title,
        description: path.description,
        slug: path.slug,
        imageUrl: path.imageUrl,
        difficulty: path.difficulty,
        sections: path.sections ? path.sections.map((section: any) => ({
          _id: section._id.toString(),
          id: section._id.toString(),
          title: section.title,
          description: section.description,
          slug: section.slug,
          order: section.order,
          pathId: section.pathId?.toString(),
          lessonCount: section.lessonCount || 0
        })) : []
      };
      
      res.status(200).json({
        success: true,
        data: cleanPath
      });
    } catch (error) {
      next(error);
    }
  };

  getSectionsByPath = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pathId } = req.params;
      
      const path = await this.curriculumService.getPath(pathId);
      
      if (!path) {
        res.status(404).json({
          success: false,
          error: 'Path not found'
        });
        return;
      }
      
      const sections = await this.curriculumService.getSectionsByPath(pathId);
      
      const cleanSections = sections.map((section: any) => ({
        _id: section._id.toString(),
        id: section._id.toString(),
        title: section.title,
        description: section.description,
        slug: section.slug,
        order: section.order,
        pathId: section.pathId?.toString(),
        lessonCount: section.lessonCount || 0
      }));
      
      res.status(200).json({
        success: true,
        count: cleanSections.length,
        data: cleanSections
      });
    } catch (error) {
      next(error);
    }
  };

  getSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sectionId } = req.params;
      const { pathId } = req.query;
      
      const section = await this.curriculumService.getSection(sectionId, pathId as string | undefined);
      
      if (!section) {
        res.status(404).json({
          success: false,
          error: 'Section not found'
        });
        return;
      }
      
      const cleanSection = {
        _id: section._id.toString(),
        id: section._id.toString(),
        title: section.title,
        description: section.description,
        slug: section.slug,
        order: section.order,
        pathId: section.pathId?.toString()
      };
      
      res.status(200).json({
        success: true,
        data: cleanSection
      });
    } catch (error) {
      next(error);
    }
  };
} 