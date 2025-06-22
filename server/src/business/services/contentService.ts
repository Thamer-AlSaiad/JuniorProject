import { IContentFormat } from '../../data/mongodb/models/lessonModel';
import mongoose from 'mongoose';
import { IContentRepository } from '../../data/repositories/IContentRepository';

export class ContentService {
  private contentRepository: IContentRepository;

  constructor(contentRepository: IContentRepository) {
    this.contentRepository = contentRepository;
  }

  async getRawContent(lessonId: string): Promise<{
    content: string,
    format: 'markdown' | 'html'
  }> {
    const lesson = await this.contentRepository.findLessonById(lessonId);
    
    if (!lesson) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }
    
    let format: 'markdown' | 'html' = 'markdown';
    let content: string = '';
    
    if (typeof lesson.content === 'object' && lesson.content !== null && 
        'format' in lesson.content) {
      const contentObj = lesson.content as IContentFormat;
      format = contentObj.format;
      content = contentObj.raw;
    } else {
      content = String(lesson.content);
      const isHtml = content.trim().startsWith('<') && /<\/?[a-z][\s\S]*>/i.test(content);
      format = isHtml ? 'html' : 'markdown';
    }
    
    return {
      content,
      format
    };
  }

  async updateLessonContent(
    lessonId: string,
    content: string | any,
    userId: string,
    changeDescription: string = 'Updated content'
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      let contentObj: IContentFormat;
      let format: 'markdown' | 'html' = 'markdown';
      
      if (typeof content === 'string') {
        const isHtml = content.trim().startsWith('<') && /<\/?[a-z][\s\S]*>/i.test(content);
        format = isHtml ? 'html' : 'markdown';
        
        contentObj = {
          raw: content,
          format,
          lastRenderedAt: new Date()
        };
      } else if (typeof content === 'object' && content !== null && 
                'raw' in content && 'format' in content) {
        const formattedContent = content as IContentFormat;
        contentObj = {
          raw: formattedContent.raw,
          format: formattedContent.format,
          lastRenderedAt: new Date()
        };
        format = formattedContent.format;
      } else {
        contentObj = {
          raw: String(content),
          format: 'markdown',
          lastRenderedAt: new Date()
        };
      }
      
      // Find existing lesson
      const lesson = await this.contentRepository.findLessonById(lessonId);
      
      if (!lesson) {
        throw new Error(`Lesson not found: ${lessonId}`);
      }
      
      const updates = {
        content: contentObj,
        lastRenderedAt: new Date()
      };

      const updatedLesson = await this.contentRepository.updateLessonWithSession(
        lessonId,
        updates,
        session
      );
      
      await session.commitTransaction();
      
      return updatedLesson;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
} 