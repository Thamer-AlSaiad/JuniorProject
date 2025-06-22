import mongoose from 'mongoose';

export interface IContentRepository {
  findLessonById(id: string): Promise<Lesson | null>;
  updateLessonContent(
    lessonId: string, 
    content: string, 
    renderedContent: string
  ): Promise<Lesson | null>;
  updateLessonWithSession(
    lessonId: string,
    updates: any,
    session: mongoose.ClientSession
  ): Promise<Lesson | null>;
}

export interface Lesson {
  _id: string;
  title: string;
  slug: string;
  sectionId: string;
  order: number;
  estimatedMinutes: number;
  content: string;
  renderedContent?: string;
  lastRenderedAt?: Date;
} 