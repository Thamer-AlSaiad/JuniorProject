import { api } from './api';
import { handleError } from './errorHandler';
import { ContentFormat } from './pathService';

export interface Lesson {
  _id: string;
  title: string;
  slug: string;
  content: string | ContentFormat;
  points: number;
  estimatedTime?: number;
  projectTitle?: string;
  projectInstructions?: string | ContentFormat;
  order: number;
}

class LessonService {
  async getLesson(pathSlug: string, courseSlug: string, sectionSlug: string, lessonSlug: string): Promise<Lesson> {
    try {
      const response = await api.get(`/lessons/${pathSlug}/${courseSlug}/${sectionSlug}/${lessonSlug}`);
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch lesson');
    }
  }

  async updateLessonProgress(lessonId: string, completed: boolean): Promise<any> {
    try {
      const response = await api.post('/user/progress/lesson', { lessonId, completed });
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to update lesson progress');
    }
  }

  async submitProject(lessonId: string, projectData: any): Promise<any> {
    try {
      const response = await api.post(`/lessons/${lessonId}/project`, projectData);
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to submit project');
    }
  }
}

export const lessonService = new LessonService();