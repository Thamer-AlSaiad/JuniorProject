import Path from '../mongodb/models/pathModel';
import type { IPath } from '../mongodb/models';
import { IPathRepository, Path as PathType } from './IPathRepository';
import mongoose from 'mongoose';

export class PathRepository implements IPathRepository {
  async findAll(): Promise<PathType[]> {
    const paths = await Path.find({}).sort({ title: 1 });
    return paths.map(path => this.mapToPath(path));
  }
  
  async findById(id: string): Promise<PathType | null> {
    const path = await Path.findById(id);
    return path ? this.mapToPath(path) : null;
  }
  
  async findBySlug(slug: string): Promise<PathType | null> {
    const path = await Path.findOne({ slug });
    return path ? this.mapToPath(path) : null;
  }
  
  async findByIdentifier(identifier: string): Promise<PathType | null> {
    const isValidId = mongoose.Types.ObjectId.isValid(identifier);
    
    if (isValidId) {
      const path = await this.findById(identifier);
      if (path) {
        return path;
      }
    }
    
    return await this.findBySlug(identifier);
  }
  
  private mapToPath(doc: IPath): PathType {
    return {
      _id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      imageUrl: doc.imageUrl,
      estimatedHours: doc.estimatedHours
    };
  }
} 