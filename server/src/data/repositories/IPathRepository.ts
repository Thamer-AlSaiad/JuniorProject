import { IPath } from '../mongodb/models';

export interface IPathRepository {
  findAll(): Promise<Path[]>;
  findById(id: string): Promise<Path | null>;
  findBySlug(slug: string): Promise<Path | null>;
  findByIdentifier(identifier: string): Promise<Path | null>;
}

export interface Path {
  _id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl?: string;
  estimatedHours: number;
} 