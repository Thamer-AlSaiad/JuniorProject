import Lesson from '../mongodb/models/lessonModel';
import type { ILesson, IContentFormat } from '../mongodb/models/lessonModel';
import { ILessonRepository, Lesson as LessonType } from './ILessonRepository';
import mongoose from 'mongoose';

export class LessonRepository implements ILessonRepository {
  async findBySection(sectionId: string): Promise<LessonType[]> {
    const lessons = await Lesson.find({ sectionId }).sort({ order: 1 });
    return lessons.map(lesson => this.mapToLesson(lesson));
  }
  
  async findById(id: string): Promise<LessonType | null> {
    const lesson = await Lesson.findById(id);
    return lesson ? this.mapToLesson(lesson) : null;
  }
  
  async findBySlug(slug: string, sectionId?: string): Promise<LessonType | null> {
    const query = { 
      slug,
      ...(sectionId ? { sectionId } : {})
    };
    
    const lesson = await Lesson.findOne(query);
    return lesson ? this.mapToLesson(lesson) : null;
  }
  
  async findByIdentifier(identifier: string, sectionId?: string): Promise<LessonType | null> {
    const isValidId = mongoose.Types.ObjectId.isValid(identifier);
    
    if (isValidId) {
      const lesson = await this.findById(identifier);
      if (lesson && (!sectionId || lesson.sectionId === sectionId)) {
        return lesson;
      }
    }
    
    return await this.findBySlug(identifier, sectionId);
  }
  
  private mapToLesson(doc: ILesson): LessonType {
    return {
      _id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug,
      sectionId: doc.sectionId.toString(),
      order: doc.order,
      estimatedMinutes: doc.estimatedMinutes,
      content: typeof doc.content === 'string' ? doc.content : doc.content.raw,
      renderedContent: doc.renderedContent,
      lastRenderedAt: doc.lastRenderedAt
    };
  }
} 