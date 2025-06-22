import mongoose from 'mongoose';
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
    return this.pathRepository.findAll();
  }
  
  async getPath(identifier: string) {
    return this.pathRepository.findByIdentifier(identifier);
  }
  
  async getSectionsByPath(pathId: string) {
    let actualPathId = pathId;
    
    if (!mongoose.Types.ObjectId.isValid(pathId)) {
      const path = await this.getPath(pathId);
      if (!path) {
        return []; 
      }
      actualPathId = path._id;
    }
    
    return this.sectionRepository.findByPath(actualPathId);
  }
  
  async getSection(identifier: string, pathId?: string) {
    return this.sectionRepository.findByIdentifier(identifier, pathId);
  }
} 