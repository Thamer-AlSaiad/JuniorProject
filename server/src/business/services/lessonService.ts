import { ILessonCompletionRepository } from '../../data/repositories/ILessonCompletionRepository';
import { ILessonRepository } from '../../data/repositories/ILessonRepository';
import { IUserRepository } from '../../data/repositories/IUserRepository';
import { ISectionRepository } from '../../data/repositories/ISectionRepository';

interface ILessonProgress {
  lessonId: string;
  title: string;
  isCompleted: boolean;
}

interface IUserSectionProgress {
  sectionId: string;
  totalLessons: number;
  completedLessons: number;
  lessonProgress: ILessonProgress[];
}

export class LessonService {
  private lessonCompletionRepository: ILessonCompletionRepository;
  private lessonRepository: ILessonRepository;
  private userRepository: IUserRepository;
  private sectionRepository: ISectionRepository;

  constructor(
    lessonCompletionRepository: ILessonCompletionRepository,
    lessonRepository: ILessonRepository,
    userRepository: IUserRepository,
    sectionRepository: ISectionRepository
  ) {
    this.lessonCompletionRepository = lessonCompletionRepository;
    this.lessonRepository = lessonRepository;
    this.userRepository = userRepository;
    this.sectionRepository = sectionRepository;
  }

  
  async getLessonsBySection(sectionId: string) {
    try {
      return await this.lessonRepository.findBySection(sectionId);
    } catch (error) {
      console.error('Error fetching lessons by section:', error);
      return [];
    }
  }
  
  async getLesson(identifier: string, sectionId?: string) {
    try {
      return await this.lessonRepository.findByIdentifier(identifier, sectionId);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      return null;
    }
  }
  
  async markLessonCompleted(lessonId: string, userId: string) {
    try {
      const lessonExists = await this.lessonRepository.findById(lessonId);
      if (!lessonExists) {
        throw new Error(`Lesson not found with ID: ${lessonId}`);
      }

      const userExists = await this.userRepository.userExists(userId);
      if (!userExists) {
        throw new Error(`User not found with ID: ${userId}`);
      }

      return await this.lessonCompletionRepository.create(userId, lessonId);
    } catch (error) {
      console.error('Error in markLessonCompleted:', error);
      throw error; 
    }
  }
  
  async getUserSectionProgress(userId: string, sectionId: string): Promise<IUserSectionProgress> {
    const lessons = await this.getLessonsBySection(sectionId);
    const lessonIds = lessons.map(lesson => lesson._id);
    const completions = await this.lessonCompletionRepository.findByUserAndLessons(userId, lessonIds);
    const completedLessonIds = completions.map(completion => completion.lessonId);
    
    return {
      sectionId,
      totalLessons: lessons.length,
      completedLessons: completions.length,
      lessonProgress: lessons.map(lesson => ({
        lessonId: lesson._id,
        title: lesson.title,
        isCompleted: completedLessonIds.includes(lesson._id)
      }))
    };
  }
  
  async getUserProgress(userId: string): Promise<Record<string, boolean>> {
    const completions = await this.lessonCompletionRepository.findByUser(userId);
    const progress: Record<string, boolean> = {};
    
    completions.forEach(completion => {
      progress[completion.lessonId] = true;
    });
    
    return progress;
  }
  
  async findById(id: string) {
    try {
      return await this.lessonRepository.findById(id);
    } catch (error) {
      console.error('Error fetching lesson by ID:', error);
      return null;
    }
  }

  async isLessonCompleted(userId: string, lessonId: string): Promise<boolean> {
    const completion = await this.lessonCompletionRepository.findOne(userId, lessonId);
    return !!completion;
  }
  
  
  async getUserPathProgress(userId: string, pathId: string): Promise<{
    completed: number;
    total: number;
    percentage: number;
    sectionProgress: {
      sectionId: string;
      title: string;
      completed: number;
      total: number;
      percentage: number;
    }[];
  }> {
    const sections = await this.sectionRepository.findByPath(pathId);
    
    let totalLessons = 0;
    let completedLessons = 0;
    const sectionProgress = [];
    for (const section of sections) {
      const lessons = await this.getLessonsBySection(section._id);
      totalLessons += lessons.length;
      
      if (lessons.length > 0) {
        const lessonIds = lessons.map(lesson => lesson._id);
        const completions = await this.lessonCompletionRepository.findByUserAndLessons(userId, lessonIds);
    
        const sectionCompletedCount = completions.length;
        completedLessons += sectionCompletedCount;
        const sectionPercentage = lessons.length > 0 
          ? Math.round((sectionCompletedCount / lessons.length) * 100) 
          : 0;
        sectionProgress.push({
          sectionId: section._id,
          title: section.title,
          completed: sectionCompletedCount,
          total: lessons.length,
          percentage: sectionPercentage
        });
      }
    }
    
    const percentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;
    
    return {
      completed: completedLessons,
      total: totalLessons,
      percentage,
      sectionProgress
    };
  }
} 