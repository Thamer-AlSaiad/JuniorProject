import mongoose, { Schema, Document } from 'mongoose';

export interface IVersionHistoryItem {
  version: number;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
  changes: string;
  content: string;
  projectInstructions?: string;
}

export interface IContentFormat {
  raw: string;         
  html?: string;       
  format: 'markdown' | 'html';  
  lastRenderedAt?: Date; 
}

export interface ILesson extends Document {
  title: string;
  slug: string;
  sectionId: mongoose.Types.ObjectId;
  order: number;
  estimatedMinutes: number;
  content: string | IContentFormat;
  renderedContent?: string;
  projectInstructions?: string | IContentFormat; 
  renderedProjectInstructions?: string;  
  lastRenderedAt?: Date; 
}

const LessonSchema = new Schema<ILesson>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    trim: true,
    lowercase: true,
    index: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: [true, 'Section ID is required'],
    index: true
  },
  order: {
    type: Number,
    default: 1
  },
  estimatedMinutes: {
    type: Number,
    default: 30
  },
  content: {
    type: Schema.Types.Mixed, 
    required: [true, 'Content is required']
  },
  renderedContent: String, 
  projectInstructions: Schema.Types.Mixed,
  renderedProjectInstructions: String,
  lastRenderedAt: Date
}, 
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: false,
  versionKey: false 
});

LessonSchema.index({ sectionId: 1, slug: 1 }, { unique: true });

// Export the model
export default mongoose.model<ILesson>('Lesson', LessonSchema);