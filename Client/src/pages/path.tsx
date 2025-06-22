"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { ArrowLeft, Clock, BookOpen, CheckCircle } from "lucide-react"
import Navbar from "../components/Navbar"
import { Path, pathService, LessonCompletion } from "./services/pathService"
import { useAuth } from "../contexts/auth-context"
import { TOKEN_STORAGE_KEY } from "./services/api"

interface SectionProgressItem {
  lessonId: string;
  title: string;
  isCompleted: boolean;
}

interface SectionCompletion {
  [key: string]: any; 
  sectionId?: string;
  totalLessons?: number;
  completedLessons?: number;
  lessonProgress?: SectionProgressItem[];
  completions?: Record<string, LessonCompletion>;
}

interface CompletionsMap {
  [sectionId: string]: SectionCompletion;
}

export default function PathPage() {
  const { slug } = useParams<{ slug: string }>()
  const [path, setPath] = useState<Path | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const [completions, setCompletions] = useState<CompletionsMap>({})

  useEffect(() => {
    async function fetchPath() {
      if (!slug) return
      
      try {
        setLoading(true)
        
        const fetchedPath = await pathService.getPath(slug)
        
        if (!fetchedPath) {
          setError("Path not found")
          return
        }

        setPath(fetchedPath)
        setError(null)

        if (user && fetchedPath.sections) {
          const sectionCompletions: CompletionsMap = {};
          
          const token = localStorage.getItem(TOKEN_STORAGE_KEY);
          if (!token) {
            setCompletions({});
            return;
          }
          
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            setCompletions({});
            return;
          }
          
          try {
            const cachedCompletions = localStorage.getItem('lessonCompletions');
            if (cachedCompletions) {
              const parsed = JSON.parse(cachedCompletions);
              if (Object.keys(parsed).length > 0) {
                for (const section of fetchedPath.sections) {
                  sectionCompletions[section._id] = {
                    sectionId: section._id,
                    totalLessons: section.lessons?.length || 0,
                    completedLessons: 0,
                    lessonProgress: [],
                    completions: {}
                  };
                  
                  if (section.lessons) {
                    const lessonProgressArray: SectionProgressItem[] = [];
                    let completedCount = 0;
                    
                    for (const lesson of section.lessons) {
                      const isCompleted = !!parsed[lesson._id];
                      
                      lessonProgressArray.push({
                        lessonId: lesson._id,
                        title: lesson.title,
                        isCompleted: isCompleted
                      });
                      
                      if (isCompleted) {
                        completedCount++;
                        sectionCompletions[section._id].completions![lesson._id] = parsed[lesson._id];
                      }
                    }
                    
                    sectionCompletions[section._id].lessonProgress = lessonProgressArray;
                    sectionCompletions[section._id].completedLessons = completedCount;
                  }
                  
                  setCompletions(sectionCompletions);
                }
              }
            }
          } catch (e) {
          }
          
          try {
            const pathCompletions = await pathService.getPathCompletions(fetchedPath._id);
            if (pathCompletions && pathCompletions.completions) {
              for (const section of fetchedPath.sections) {
                sectionCompletions[section._id] = {
                  sectionId: section._id,
                  totalLessons: section.lessons?.length || 0,
                  completedLessons: 0,
                  lessonProgress: [],
                  completions: {}
                };
                
                if (section.lessons) {
                  const lessonProgressArray: SectionProgressItem[] = [];
                  let completedCount = 0;
                  
                  for (const lesson of section.lessons) {
                    const isCompleted = !!pathCompletions.completions[lesson._id];
                    
                    lessonProgressArray.push({
                      lessonId: lesson._id,
                      title: lesson.title,
                      isCompleted: isCompleted
                    });
                    
                    if (pathCompletions.completions[lesson._id]) {
                      completedCount++;
                      sectionCompletions[section._id].completions![lesson._id] = 
                        pathCompletions.completions[lesson._id];
                    }
                  }
                
                  sectionCompletions[section._id].lessonProgress = lessonProgressArray;
                  sectionCompletions[section._id].completedLessons = completedCount;
                }
              }
              
              setCompletions(sectionCompletions);
              return;
            }
          } catch (err: any) {
            if (err.response?.status === 401) {
              setCompletions({});
              return;
            }
          }
          
          let authFailed = false;
          
          for (const section of fetchedPath.sections) {
            if (authFailed) break;
            
            try {
              const sectionCompletionData = await pathService.getSectionCompletions(section._id);
              if (sectionCompletionData) {
                sectionCompletions[section._id] = sectionCompletionData as SectionCompletion;
              }
            } catch (err: any) {
              if (err.response?.status === 401) {
                authFailed = true;
              }
            }
          }
          
          setCompletions(sectionCompletions);
        }
      } catch (err) {
        setError("Failed to load path. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchPath()
  }, [slug, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5ff]">
        <Navbar />
        <div className="container px-4 py-12 mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#593797]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !path) {
    return (
      <div className="min-h-screen bg-[#f8f5ff]">
        <Navbar />
        <div className="container px-4 py-12 mx-auto">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-2xl font-bold text-red-700 mb-4">Oops!</h2>
            <p className="text-red-700 mb-6">{error || "Path not found"}</p>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isLessonCompleted = (sectionId: string, lessonId: string): boolean => {
    const sectionCompletion = completions[sectionId];
    if (!sectionCompletion) {
      return false;
    }
    
    const normalizedLessonId = lessonId.toString();
    
    if (sectionCompletion.completions) {
      const exactMatch = sectionCompletion.completions[normalizedLessonId];
      if (exactMatch) {
        return true;
      }
      
      const completionEntries = Object.entries(sectionCompletion.completions);
      for (const [key, value] of completionEntries) {
        if (key.toLowerCase() === normalizedLessonId.toLowerCase() || 
            key.replace(/[^a-f0-9]/gi, '') === normalizedLessonId.replace(/[^a-f0-9]/gi, '')) {
          return true;
        }

        if (value && typeof value === 'object' && 'lessonId' in value) {
          const storedLessonId = String(value.lessonId);
          if (storedLessonId === normalizedLessonId || 
              storedLessonId.toLowerCase() === normalizedLessonId.toLowerCase() ||
              storedLessonId.replace(/[^a-f0-9]/gi, '') === normalizedLessonId.replace(/[^a-f0-9]/gi, '')) {
            return true;
          }
        }
      }
    }
    
    if (sectionCompletion.lessonProgress && Array.isArray(sectionCompletion.lessonProgress)) {
      const isCompleted = sectionCompletion.lessonProgress.some(progress => {
        const progressId = String(progress.lessonId);
        return (progress.isCompleted && 
               (progressId === normalizedLessonId || 
                progressId.toLowerCase() === normalizedLessonId.toLowerCase() ||
                progressId.replace(/[^a-f0-9]/gi, '') === normalizedLessonId.replace(/[^a-f0-9]/gi, '')));
      });
      
      if (isCompleted) {
        return true;
      }
    }
    
    if (sectionCompletion[normalizedLessonId]) {
      return true;
    }
    
    return false;
  }

  return (
    <div className="min-h-screen bg-[#f8f5ff]">
      <Navbar />
      
      <div className="w-full bg-gradient-to-b from-[#2e283c] to-[#1a1625] py-16 text-white">
        <div className="container px-4 mx-auto">
          <Link to="/" className="inline-flex items-center text-white hover:text-[#d4cce2] mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all paths
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img 
                  src={path.imageUrl}
                  alt={path.title}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                  }}
                />
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{path.title}</h1>
              <p className="text-lg text-[#d4cce2] mb-8">{path.description}</p>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-[#d4cce2] mr-2" />
                  <span className="text-sm text-[#d4cce2]">{path.estimatedHours} hours</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-[#d4cce2] mr-2" />
                  <span className="text-sm text-[#d4cce2]">{path.sections?.length || 0} sections</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      <div className="container px-4 py-16 mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-[#2e283c]">
          Curriculum
        </h2>
        
        <div className="space-y-8">
          {path.sections?.map((section: any) => (
            <div key={section._id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-[#2e283c] text-white p-6">
                <h3 className="text-xl font-semibold">{section.title}</h3>
                <p className="text-gray-300 mt-2">{section.description}</p>
              </div>
              
              {section.lessons && section.lessons.length > 0 && (
                <div className="bg-white">
                  <ul className="divide-y divide-gray-100">
                    {section.lessons.map((lesson: any) => {
                      const isCompleted = isLessonCompleted(section._id, lesson._id);
                      
                      return (
                        <Link 
                          key={lesson._id} 
                          to={`/paths/${slug}/sections/${section.slug}/lessons/${lesson.slug}`}
                          className="block"
                        >
                          <li className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-3 text-[#593797]">
                              {isCompleted ? (
                                <div className="w-5 h-5 text-green-500">
                                  <CheckCircle className="w-5 h-5" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-[#593797] flex items-center justify-center">
                                  <span className="text-xs font-bold text-[#593797]">{lesson.order === 99 ? "P" : lesson.order}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-grow">
                              <h5 className="font-medium text-[#2e283c]">{lesson.title}</h5>
                              <p className="text-xs text-gray-500 mt-1">
                                {lesson.estimatedMinutes} mins
                                {isCompleted && " · Completed"}
                              </p>
                            </div>
                          </div>
                        </li>
                        </Link>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 