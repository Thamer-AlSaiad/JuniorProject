import mongoose from 'mongoose';
import { CacheService } from './cacheService';
import { IPathRepository } from '../../data/repositories/IPathRepository';
import { ISectionRepository } from '../../data/repositories/ISectionRepository';

export class CurriculumService {
  private pathRepository: IPathRepository;
  private sectionRepository: ISectionRepository;

  constructor(
    pathRepository: IPathRepository,
    sectionRepository: ISectionRepository
  ) {
    this.pathRepository = pathRepository;
    this.sectionRepository = sectionRepository;
  }

  async getPaths() {
    const cacheKey = 'paths_all';
    
    return CacheService.getOrSet(cacheKey, async () => {
      return this.pathRepository.findAll();
    });
  }
  
  async getPath(identifier: string) {
    const cacheKey = `path_${identifier}`;
    
    return CacheService.getOrSet(cacheKey, async () => {
      return this.pathRepository.findByIdentifier(identifier);
    });
  }
  
  async getSectionsByPath(pathId: string) {
    const cacheKey = `sections_by_path_${pathId}`;
    
    return CacheService.getOrSet(cacheKey, async () => {
      let actualPathId = pathId;
      
      if (!mongoose.Types.ObjectId.isValid(pathId)) {
        const path = await this.getPath(pathId);
        if (!path) {
          return []; 
        }
        actualPathId = path._id;
      }
      
      return this.sectionRepository.findByPath(actualPathId);
    });
  }
  
  async getSection(identifier: string, pathId?: string) {
    const cacheKey = `section_${identifier}_${pathId || 'any'}`;
    
    return CacheService.getOrSet(cacheKey, async () => {
      return this.sectionRepository.findByIdentifier(identifier, pathId);
    });
  }
} 