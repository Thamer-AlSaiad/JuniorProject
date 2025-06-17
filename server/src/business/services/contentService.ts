import { IContentFormat } from '../../data/mongodb/models/lessonModel';
import mongoose from 'mongoose';
import { CacheService } from './cacheService';
import { IContentRepository } from '../../data/repositories/IContentRepository';
import sanitizeHtml from 'sanitize-html';
import { processMarkdown } from './markdownService';

export class ContentService {
  private contentRepository: IContentRepository;

  constructor(contentRepository: IContentRepository) {
    this.contentRepository = contentRepository;
  }


  async getRenderedContent(lessonId: string): Promise<{ 
    content: string, 
    format?: 'markdown' | 'html'
  }> {
    const cacheKey = `lesson_content_${lessonId}`;
    
    return CacheService.getOrSet(cacheKey, async () => {
      const lesson = await this.contentRepository.findLessonById(lessonId);
      
      if (!lesson) {
        throw new Error(`Lesson not found: ${lessonId}`);
      }
      
      const { renderedContent, format: contentFormat } = this.renderContent(lesson.content);
      
      await this.contentRepository.updateLessonContent(
        lessonId,
        lesson.content,
        renderedContent
      );
      
      return {
        content: renderedContent,
        format: contentFormat
      };
    });
  }
  
  /**
   * Render content based on its format
   * @param content The content to render (string or IContentFormat)
   * @returns The rendered HTML and format type
   */
  private renderContent(content: string | any): { 
    renderedContent: string, 
    format: 'markdown' | 'html' 
  } {
    if (typeof content === 'object' && content !== null && 
        'raw' in content && 'format' in content) {
      const contentObj = content as IContentFormat;
      
      if (contentObj.html && contentObj.lastRenderedAt) {
        const cacheAge = Date.now() - new Date(contentObj.lastRenderedAt).getTime();
        if (cacheAge < 3600000) {
          return { 
            renderedContent: contentObj.html,
            format: contentObj.format
          };
        }
      }
      
      if (contentObj.format === 'html') {
        const sanitized = sanitizeHtml(contentObj.raw);
        return { renderedContent: sanitized, format: 'html' };
      } else {
        return { 
          renderedContent: processMarkdown(contentObj.raw),
          format: 'markdown'
        };
      }
    }

    const contentStr = typeof content === 'string' ? content : 
      (typeof content === 'object' && content !== null && 'raw' in content) ? 
        content.raw : String(content);
    
    const isHtml = contentStr.trim().startsWith('<') && /<\/?[a-z][\s\S]*>/i.test(contentStr);
    
    if (isHtml) {
      const sanitized = sanitizeHtml(contentStr);
      return { renderedContent: sanitized, format: 'html' };
    } else {
      return { 
        renderedContent: processMarkdown(contentStr),
        format: 'markdown'
      };
    }
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
          html: formattedContent.html,
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
      
      const { renderedContent } = this.renderContent(contentObj);
      
      const updates = {
        content: contentObj,
        renderedContent,
        lastRenderedAt: new Date()
      };

      const updatedLesson = await this.contentRepository.updateLessonWithSession(
        lessonId,
        updates,
        session
      );
      
      await session.commitTransaction();
      
      CacheService.delete(`lesson_content_${lessonId}`);
      CacheService.deleteByPattern(`^lesson_${lessonId}`);
      
      return updatedLesson;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  
  async getRawContent(lessonId: string): Promise<{
    content: string | any,
    format: 'markdown' | 'html'
  }> {
    const lesson = await this.contentRepository.findLessonById(lessonId);
    
    if (!lesson) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }
    
    let format: 'markdown' | 'html' = 'markdown';
    let content: string | any = '';
    
    if (typeof lesson.content === 'object' && lesson.content !== null && 
        'format' in lesson.content) {
      const contentObj = lesson.content as IContentFormat;
      format = contentObj.format;
      content = lesson.content;
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
} 