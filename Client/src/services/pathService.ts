import { api, directApi, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "./api";

export interface Section {
  _id: string;
  title: string;
  description: string;
  slug: string;
  order: number;
  pathId: string;
  estimatedHours: number;
  lessons?: Lesson[];
}

export interface ContentFormat {
  raw: string;
  html?: string;
  format: 'markdown' | 'html';
  lastRenderedAt?: Date;
}

export interface Lesson {
  _id: string;
  title: string;
  slug: string;
  estimatedMinutes: number;
  order: number;
  content?: string | ContentFormat;
  projectInstructions?: string | ContentFormat;
}

export interface LessonCompletion {
  _id: string;
  userId: string;
  lessonId: string;
}

export interface Path {
  _id: string;
  title: string;
  description: string;
  slug: string;
  estimatedHours: number;
  imageUrl?: string;
  order: number;
  sections?: Section[];
}

export const pathService = {
  async getAllPaths(): Promise<Path[]> {
    try {
      const response = await api.get(`/curriculum/paths`);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      return [];
    }
  },

  async getPath(identifier: string): Promise<Path | null> {
    try {
      const response = await api.get(`/curriculum/paths/${identifier}`);
      
      let pathData;
      
      if (response.data && response.data.data) {
        pathData = response.data.data;
      } else if (response.data) {
        pathData = response.data;
      }
      
      if (!pathData) {
        return null;
      }
      
      if (!pathData.sections || pathData.sections.length === 0) {
        try {
          const sectionsResponse = await api.get(`/curriculum/paths/${identifier}/sections`);
          
          if (sectionsResponse.data && Array.isArray(sectionsResponse.data.data)) {
            pathData.sections = sectionsResponse.data.data;
          } else if (sectionsResponse.data && Array.isArray(sectionsResponse.data)) {
            pathData.sections = sectionsResponse.data;
          }
        } catch (sectionsError) {
        }
      }

      if (pathData.sections && pathData.sections.length > 0) {
        for (const section of pathData.sections) {
          try {
            section.lessons = [];
            
            if (!section._id) {
              console.error('Section is missing _id, cannot fetch lessons');
              continue; 
            }
            
            const lessonsUrl = `/curriculum/sections/${section._id}/lessons`;
            const lessonsResponse = await api.get(lessonsUrl);
            
            let lessons = [];
            if (lessonsResponse.data && Array.isArray(lessonsResponse.data.data)) {
              lessons = lessonsResponse.data.data;
            } else if (lessonsResponse.data && Array.isArray(lessonsResponse.data)) {
              lessons = lessonsResponse.data;
            }
            
            section.lessons = lessons;
          } catch (lessonsError) {
            console.error(`Error fetching lessons for section ${section._id || 'unknown'}:`, lessonsError);
          }
        }
      }
      
      return pathData;
    } catch (error) {
      return null;
    }
  },

  async getLessonContent(lessonId: string): Promise<any> {
    try {
      const response = await api.get(`/curriculum/lessons/${lessonId}/content`);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  },

  async getLesson(lessonId: string): Promise<Lesson | null> {
    try {
      const response = await api.get(`/curriculum/lessons/${lessonId}`);
      
      let result = null;
      if (response.data && response.data.data) {
        result = response.data.data;
      } else if (response.data) {
        result = response.data;
      }
      

      if (result && (!result.content || result.content.trim() === '')) {
        try {
          const contentResponse = await api.get(`/curriculum/lessons/${lessonId}/content`);
          
          if (contentResponse.data && contentResponse.data.data) {
            result.content = contentResponse.data.data.content;
            if (contentResponse.data.data.projectInstructions) {
              result.projectInstructions = contentResponse.data.data.projectInstructions;
            }
          }
        } catch (contentError) {
        }
      }
      
      return result;
    } catch (error) {
      return null;
    }
  },

  async getLessonRawContent(lessonId: string): Promise<any> {
    try {
      const response = await api.get(`/curriculum/lessons/${lessonId}?raw=true`);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Mark a lesson as completed for the current user
   * @param lessonId The ID of the lesson to mark as completed
   * @returns The lesson completion object
   */
  async markLessonCompleted(lessonId: string): Promise<LessonCompletion | null> {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      
      if (!token) {
        return null;
      }
      
      const url = `/curriculum/lessons/${lessonId}/complete`;
      
      const response = await api.post(url, {});
      
      if (response.data && response.data.success) {
        const completion = response.data.data;
        if (completion && completion._id && completion.userId && completion.lessonId) {
          return completion;
        }
      }
      
      return null;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Get lesson completion status for a section
   * @param sectionId The ID of the section
   * @returns Record of lesson completions or null if error/unauthorized
   */
  async getSectionCompletions(sectionId: string): Promise<{
    sectionId: string;
    totalLessons: number;
    completedLessons: number;
    lessonProgress: {
      lessonId: string;
      title: string;
      isCompleted: boolean;
    }[];
    completions?: Record<string, LessonCompletion>;
  } | null> {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      
      let userId = "unknown";
      try {
        const userStr = localStorage.getItem(USER_STORAGE_KEY);
        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user.id || "not-found";
        }
      } catch (e) {
      }
      
      if (!token) {
        return null;
      }
      
      const url = `/curriculum/sections/${sectionId}/progress`;
      
      try {
        const response = await directApi.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache', 
            'X-Debug-UserId': userId 
          }
        });
        
        if (response.data && response.data.success && response.data.data) {
          const progressData = response.data.data;
          
          const completionsMap: Record<string, LessonCompletion> = {};
          
          if (progressData.lessonProgress && Array.isArray(progressData.lessonProgress)) {
            progressData.lessonProgress.forEach((lesson: { lessonId: string; title: string; isCompleted: boolean }) => {
              if (lesson.isCompleted) {
                completionsMap[lesson.lessonId] = {
                  _id: `completion_${lesson.lessonId}`,
                  userId: userId,
                  lessonId: lesson.lessonId,
                } as LessonCompletion;
              }
            });
          }
          
          return {
            ...progressData,
            completions: completionsMap
          };
        }
        
        return null;
      } catch (error: any) {
        if (error.response?.status === 401) {
          if (error.response?.data?.message?.includes('Invalid token')) {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
          }
          return null;
        }
        throw error;
      }
    } catch (error: any) {
      return null;
    }
  },

  /**
   * Get completion status for all lessons in a path
   * @param pathId The ID of the path
   * @returns An object with completion statistics and a map of lessonId to completion status
   */
  async getPathCompletions(pathId: string): Promise<{ 
    completedCount: number; 
    totalCount: number; 
    completions: Record<string, LessonCompletion>;
    percentage: number;
    sectionProgress?: any[];
  } | null> {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      
      if (!token) {
        return null;
      }
      
      const url = `/curriculum/paths/${pathId}/progress`;
      
      try {
        const response = await directApi.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'  
          }
        });
        
        if (response.data && response.data.data) {
          const progressData = response.data.data;
          const completionsMap: Record<string, LessonCompletion> = {};
          
          if (progressData.completions && Array.isArray(progressData.completions)) {
            progressData.completions.forEach((completion: LessonCompletion) => {
              completionsMap[completion.lessonId] = completion;
            });
          }
          
          if (Object.keys(completionsMap).length === 0 && 
              progressData.sectionProgress && 
              Array.isArray(progressData.sectionProgress)) {
            
            try {
              const sectionIds = progressData.sectionProgress.map((section: any) => section.sectionId);
              
              for (const sectionId of sectionIds) {
                try {
                  const sectionProgress = progressData.sectionProgress.find(
                    (s: any) => s.sectionId === sectionId
                  );
                  
                  if (sectionProgress && sectionProgress.completed > 0) {
                    const lessonsUrl = `/curriculum/sections/${sectionId}/lessons`;
                    const lessonsResponse = await api.get(lessonsUrl);
                    let lessons = [];
                    
                    if (lessonsResponse.data && lessonsResponse.data.data) {
                      lessons = lessonsResponse.data.data;
                    } else if (lessonsResponse.data) {
                      lessons = lessonsResponse.data;
                    }
                    
                    if (lessons.length > 0) {
                      const sectionCompletions = await this.getSectionCompletions(sectionId);
                      if (sectionCompletions && sectionCompletions.completions) {
                        for (const [lessonId, completion] of Object.entries(sectionCompletions.completions)) {
                          completionsMap[lessonId] = completion;
                        }
                      }
                    }
                  }
                } catch (sectionError) {
                }
              }
            } catch (error) {
            }
          }
          
          return {
            completedCount: progressData.completed || 0,
            totalCount: progressData.total || 0,
            percentage: progressData.percentage || 0,
            completions: completionsMap,
            sectionProgress: progressData.sectionProgress || []
          };
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          if (error.response?.data?.message?.includes('Invalid token')) {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
          }
          return null;
        }
        throw error;
      }
      
      return null;
    } catch (error: any) {
      return null;
    }
  },

  /**
   * DIRECT METHOD: Track lesson completion without fancy auth handling
   * Uses exact MongoDB schema from screenshot
   * @param lessonId The ID of the lesson to mark as completed 
   * @returns Promise<boolean> Success status
   */
  async trackCompletion(lessonId: string): Promise<boolean> {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token || token.split('.').length !== 3) {
        return false;
      }
      
      let userId = '';
      try {
        const userStr = localStorage.getItem(USER_STORAGE_KEY);
        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user.id ? String(user.id) : '';
        }
      } catch (e) {
      }

      if (!userId) {
        try {
          const timestamp = new Date().getTime();
          const userResponse = await directApi.get(`/auth/me?_t=${timestamp}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (userResponse.data && userResponse.data.user && userResponse.data.user.id) {
            userId = String(userResponse.data.user.id);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userResponse.data.user));
          }
        } catch (userError: any) {
          if (userError.response?.status === 401) {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
          }
          
          return false;
        }
      }
      
      if (!userId) {
        return false;
      }
      
      try {
        const inspectUrl = `/curriculum/lessons/${lessonId}/inspect`;
        const inspectResponse = await directApi.get(inspectUrl, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'X-Debug-UserId': userId 
          }
        });
        
        if (inspectResponse.data && inspectResponse.data.success) {
          if (inspectResponse.data.data.isCompleted) {
            return true;
          }
        }
      } catch (inspectError) {
      }
      
      const payload = {
        lessonId
      };
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const timestamp = new Date().getTime();
      const url = `/curriculum/lessons/${lessonId}/complete?_t=${timestamp}`;

      const response = await directApi.post(
        url,
        payload,
        { headers }
      );

      if (response.data && response.data.success) {
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
      
      return false;
    }
  }
};