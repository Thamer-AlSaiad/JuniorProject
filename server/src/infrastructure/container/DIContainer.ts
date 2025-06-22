import { UserRepository } from '../../data/repositories/user.repository';
import { LessonCompletionRepository } from '../../data/repositories/lessonCompletion.repository';
import { LessonRepository } from '../../data/repositories/lesson.repository';
import { PathRepository } from '../../data/repositories/path.repository';
import { SectionRepository } from '../../data/repositories/section.repository';
import { ContentRepository } from '../../data/repositories/content.repository';

import TokenService from '../../shared/services/TokenService'; 
import EmailService from '../../shared/services/EmailService';
import HashService from '../../shared/services/HashService';

import { AuthService } from '../../business/auth/authService';
import { UserService } from '../../business/user/userService';
import { LessonService } from '../../business/services/lessonService';
import { ContentService } from '../../business/services/contentService';
import { CurriculumService } from '../../business/services/curriculumService';

import { AuthController } from '../../business/auth/authController';
import { UserController } from '../../business/user/userController';
import { LessonController } from '../../business/learning/lessonController';
import { CurriculumController } from '../../business/learning/curriculumController';
import { ContentController } from '../../business/learning/contentController';
import { authMiddleware } from '../../shared/middlewares/AuthMiddleware';

class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.initializeServices();
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  private initializeServices(): void {
    this.services.set('userRepository', new UserRepository());
    this.services.set('lessonCompletionRepository', new LessonCompletionRepository());
    this.services.set('lessonRepository', new LessonRepository());
    this.services.set('pathRepository', new PathRepository());
    this.services.set('sectionRepository', new SectionRepository());
    this.services.set('contentRepository', new ContentRepository());

    this.services.set('tokenService', TokenService);
    this.services.set('emailService', EmailService);
    this.services.set('hashService', HashService);

    this.services.set('authService', new AuthService(
      this.get('userRepository'),
      this.get('tokenService'),
      this.get('emailService'),
      this.get('hashService')
    ));

    this.services.set('userService', new UserService(
      this.get('userRepository'),
      this.get('hashService')
    ));

    this.services.set('lessonService', new LessonService(
      this.get('lessonCompletionRepository'),
      this.get('lessonRepository'),
      this.get('userRepository'),
      this.get('sectionRepository')
    ));

    this.services.set('contentService', new ContentService(this.get('contentRepository')));
    this.services.set('curriculumService', new CurriculumService(
      this.get('pathRepository'),
      this.get('sectionRepository')
    ));

    this.services.set('authController', new AuthController(this.get('authService')));
    this.services.set('userController', new UserController(this.get('userService')));
    this.services.set('lessonController', new LessonController(
      this.get('lessonService'),
      this.get('contentService')
    ));
    this.services.set('curriculumController', new CurriculumController(this.get('curriculumService')));
    this.services.set('contentController', new ContentController(this.get('contentService')));

    this.services.set('authMiddleware', authMiddleware);
  }

  public get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found in DI container`);
    }
    return service;
  }

  public register<T>(serviceName: string, service: T): void {
    this.services.set(serviceName, service);
  }
}

export const container = DIContainer.getInstance();
export const DI = {
  get userRepository() { return container.get<UserRepository>('userRepository'); },
  get lessonCompletionRepository() { return container.get<LessonCompletionRepository>('lessonCompletionRepository'); },
  get lessonRepository() { return container.get<LessonRepository>('lessonRepository'); },
  get pathRepository() { return container.get<PathRepository>('pathRepository'); },
  get sectionRepository() { return container.get<SectionRepository>('sectionRepository'); },
  get contentRepository() { return container.get<ContentRepository>('contentRepository'); },
  
  get authService() { return container.get<AuthService>('authService'); },
  get userService() { return container.get<UserService>('userService'); },
  get lessonService() { return container.get<LessonService>('lessonService'); },
  get contentService() { return container.get<ContentService>('contentService'); },
  get curriculumService() { return container.get<CurriculumService>('curriculumService'); },
  
  get authMiddleware() { return container.get<typeof authMiddleware>('authMiddleware'); },
  

  get authController() { return container.get<AuthController>('authController'); },
  get userController() { return container.get<UserController>('userController'); },
  get lessonController() { return container.get<LessonController>('lessonController'); },
  get curriculumController() { return container.get<CurriculumController>('curriculumController'); },
  get contentController() { return container.get<ContentController>('contentController'); }
};