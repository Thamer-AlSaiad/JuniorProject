import * as mongoose from 'mongoose';
const { Schema } = mongoose;

export interface ILessonCompletion extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
}

const lessonCompletionSchema = new Schema<ILessonCompletion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true }
  },
  { timestamps: false, versionKey: false }
);

lessonCompletionSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

lessonCompletionSchema.index({ lessonId: 1 });

const LessonCompletion = mongoose.model<ILessonCompletion>('LessonCompletion', lessonCompletionSchema);

export default LessonCompletion; 