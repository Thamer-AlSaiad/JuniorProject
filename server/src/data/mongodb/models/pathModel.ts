import * as mongoose from 'mongoose';
const { Schema } = mongoose;

export interface IPath extends mongoose.Document {
  title: string;
  slug: string;
  description: string;
  imageUrl?: string;
  estimatedHours: number;
}

const pathSchema = new Schema<IPath>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    estimatedHours: { type: Number, required: true }
  },
  { 
    timestamps: false,
    versionKey: false
  }
);

pathSchema.index({ slug: 1 });

const Path = mongoose.model<IPath>('Path', pathSchema);

export default Path; 