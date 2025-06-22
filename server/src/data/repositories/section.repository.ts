import Section from '../mongodb/models/sectionModel';
import type { ISection } from '../mongodb/models';
import { ISectionRepository, Section as SectionType } from './ISectionRepository';
import mongoose from 'mongoose';

export class SectionRepository implements ISectionRepository {
  async findByPath(pathId: string): Promise<SectionType[]> {
    const sections = await Section.find({ pathId }).sort({ order: 1 });
    return sections.map(section => this.mapToSection(section));
  }
  
  async findById(id: string): Promise<SectionType | null> {
    const section = await Section.findById(id);
    return section ? this.mapToSection(section) : null;
  }
  
  async findBySlug(slug: string, pathId?: string): Promise<SectionType | null> {
    const query = { 
      slug,
      ...(pathId ? { pathId } : {})
    };
    
    const section = await Section.findOne(query);
    return section ? this.mapToSection(section) : null;
  }
  
  async findByIdentifier(identifier: string, pathId?: string): Promise<SectionType | null> {
    const isValidId = mongoose.Types.ObjectId.isValid(identifier);
    
    if (isValidId) {
      const section = await this.findById(identifier);
      if (section && (!pathId || section.pathId === pathId)) {
        return section;
      }
    }
    
    return await this.findBySlug(identifier, pathId);
  }
  
  private mapToSection(doc: ISection): SectionType {
    return {
      _id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      pathId: doc.pathId.toString(),
      order: doc.order,
      estimatedHours: doc.estimatedHours
    };
  }
} 