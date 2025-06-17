import LessonCompletion from '../mongodb/models/lessonCompletionModel';
import { ILessonCompletion } from '../mongodb/models/lessonCompletionModel';
import { ILessonCompletionRepository, LessonCompletion as LessonCompletionType } from './ILessonCompletionRepository';

export class LessonCompletionRepository implements ILessonCompletionRepository {
  async findOne(userId: string, lessonId: string): Promise<LessonCompletionType | null> {
    const completion = await LessonCompletion.findOne({ userId, lessonId });
    return completion ? this.mapToCompletion(completion) : null;
  }

  async findByUser(userId: string): Promise<LessonCompletionType[]> {
    const completions = await LessonCompletion.find({ userId });
    return completions.map(completion => this.mapToCompletion(completion));
  }

  async findByUserAndLessons(userId: string, lessonIds: string[]): Promise<LessonCompletionType[]> {
    const completions = await LessonCompletion.find({ 
      userId, 
      lessonId: { $in: lessonIds } 
    });
    return completions.map(completion => this.mapToCompletion(completion));
  }

  async create(userId: string, lessonId: string): Promise<LessonCompletionType> {
    const existing = await LessonCompletion.findOne({ userId, lessonId });
    if (existing) {
      return this.mapToCompletion(existing);
    }
    
    const completion = await LessonCompletion.create({ userId, lessonId });
    return this.mapToCompletion(completion);
  }

  private mapToCompletion(doc: ILessonCompletion): LessonCompletionType {
    return {
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      lessonId: doc.lessonId.toString()
    };
  }
} 