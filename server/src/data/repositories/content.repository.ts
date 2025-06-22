import Lesson from '../mongodb/models/lessonModel';
import type { ILesson, IContentFormat } from '../mongodb/models/lessonModel';
import { IContentRepository, Lesson as LessonType } from './IContentRepository';
import mongoose from 'mongoose';

export class ContentRepository implements IContentRepository {
  async findLessonById(id: string): Promise<LessonType | null> {
    const lesson = await Lesson.findById(id);
    return lesson ? this.mapToLesson(lesson) : null;
  }

  async updateLessonContent(
    lessonId: string, 
    content: string, 
    renderedContent: string
  ): Promise<LessonType | null> {
    const updates: any = {
      content,
      renderedContent,
      lastRenderedAt: new Date()
    };

    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      updates,
      { new: true }
    );

    return updatedLesson ? this.mapToLesson(updatedLesson) : null;
  }

  async updateLessonWithSession(
    lessonId: string,
    updates: any,
    session: mongoose.ClientSession
  ): Promise<LessonType | null> {
    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      updates,
      { new: true, session }
    );

    return updatedLesson ? this.mapToLesson(updatedLesson) : null;
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