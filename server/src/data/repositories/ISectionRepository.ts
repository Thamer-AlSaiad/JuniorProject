import { ISection } from '../mongodb/models';

export interface ISectionRepository {
  findByPath(pathId: string): Promise<Section[]>;
  findById(id: string): Promise<Section | null>;
  findBySlug(slug: string, pathId?: string): Promise<Section | null>;
  findByIdentifier(identifier: string, pathId?: string): Promise<Section | null>;
}

export interface Section {
  _id: string;
  title: string;
  slug: string;
  description: string;
  pathId: string;
  order: number;
  estimatedHours: number;
} 