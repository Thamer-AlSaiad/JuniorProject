import * as mongoose from 'mongoose';
const { Schema } = mongoose;

export interface ISection extends mongoose.Document {
  title: string;
  slug: string;
  description: string;
  pathId: mongoose.Types.ObjectId;
  order: number;
  estimatedHours: number;
}

const sectionSchema = new Schema<ISection>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    pathId: { type: Schema.Types.ObjectId, ref: 'Path', required: true },
    order: { type: Number, required: true },
    estimatedHours: { type: Number, required: true }
  },
  { 
    timestamps: false,
    versionKey: false
  }
);

sectionSchema.index({ pathId: 1, slug: 1 }, { unique: true });

sectionSchema.index({ pathId: 1, order: 1 });

const Section = mongoose.model<ISection>('Section', sectionSchema);

export default Section; 