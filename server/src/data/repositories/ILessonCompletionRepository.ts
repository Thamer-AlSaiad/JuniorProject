import { ILessonCompletion } from '../mongodb/models/lessonCompletionModel';
import mongoose from 'mongoose';

export interface ILessonCompletionRepository {
  findOne(userId: string, lessonId: string): Promise<LessonCompletion | null>;
  findByUser(userId: string): Promise<LessonCompletion[]>;
  findByUserAndLessons(userId: string, lessonIds: string[]): Promise<LessonCompletion[]>;
  create(userId: string, lessonId: string): Promise<LessonCompletion>;
}

export interface LessonCompletion {
  _id: string;
  userId: string;
  lessonId: string;
} 