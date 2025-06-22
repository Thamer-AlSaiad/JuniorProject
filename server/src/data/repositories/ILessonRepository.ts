import { IContentFormat } from '../mongodb/models/lessonModel';
import mongoose from 'mongoose';

export interface ILessonRepository {
  findBySection(sectionId: string): Promise<Lesson[]>;
  findById(id: string): Promise<Lesson | null>;
  findBySlug(slug: string, sectionId?: string): Promise<Lesson | null>;
  findByIdentifier(identifier: string, sectionId?: string): Promise<Lesson | null>;
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