"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { ArrowLeft, Clock, Check, CheckCircle, Menu, X } from "lucide-react"
import Navbar from "../components/Navbar"
import { pathService } from "../services/pathService"
import type { Lesson } from "../services/pathService"
import type { LessonCompletion } from "../services/pathService"
import { useAuth } from "../contexts/auth-context"
import { markdownToHtml } from "../utils/markdownProcessor"
import "highlight.js/styles/vs2015.css"
import hljs from 'highlight.js';
import python from 'highlight.js/lib/languages/python';
import logo from "../assets/404-il.svg"
import AnimatedBackground from "../components/AnimatedBackground"
import { toast } from "../components/ui/toast-wrapper"
hljs.registerLanguage('python', python);

interface LessonWithContent extends Lesson {
  content: string
  completionStatus?: LessonCompletion
}

const MarkdownContent = ({ content }: { content: string }) => {
  const html = markdownToHtml(content);
  
  return (
    <div 
      className="prose prose-invert max-w-none bg-transparent text-[#d4cce2]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default function LessonPage() {
  const { pathSlug, sectionSlug, lessonSlug } = useParams<{
    pathSlug: string
    sectionSlug: string
    lessonSlug: string
  }>()

  const [lesson, setLesson] = useState<LessonWithContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [path, setPath] = useState<any>(null)
  const [section, setSection] = useState<any>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [completionLoading, setCompletionLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (sidebarOpen && 
          window.innerWidth < 768 && 
          !target.closest('[data-sidebar]') && 
          !target.closest('[data-sidebar-toggle]')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    async function fetchData() {
      if (!pathSlug || !sectionSlug || !lessonSlug) return

      try {
        setLoading(true)
        const pathData = await pathService.getPath(pathSlug)
        if (!pathData) {
          setError("Path not found")
          return
        }
        setPath(pathData)

        const matchedSection = pathData.sections?.find((s) => s.slug === sectionSlug)
        if (!matchedSection) {
          setError("Section not found")
          return
        }
        setSection(matchedSection)

        const lessonsFromSection: Lesson[] = matchedSection.lessons || []
        setAllLessons(lessonsFromSection)

        const matchedLesson = matchedSection.lessons?.find((l) => l.slug === lessonSlug)
        if (!matchedLesson) {
          setError("Lesson not found")
          return
        }

        let lessonContent
        try {
          lessonContent = await pathService.getLessonContent(matchedLesson._id)
        } catch (err) {
          console.error("Error fetching lesson content:", err)
          setError("Failed to load lesson content")
          return
        }

        let completionStatus = undefined
        if (user) {
          try {
            const sectionCompletions = await pathService.getSectionCompletions(matchedSection._id)
            if (sectionCompletions && sectionCompletions.completions && sectionCompletions.completions[matchedLesson._id]) {
              completionStatus = sectionCompletions.completions[matchedLesson._id]
            }
          } catch (err) {
            console.warn("Could not get completion status - continuing with content display:", err)
          }
        }

        const fullLesson: LessonWithContent = {
          ...matchedLesson,
          content: lessonContent?.content || "Content not available",
          completionStatus,
        }

        setLesson(fullLesson)
      } catch (err) {
        console.error("Error fetching lesson:", err)
        setError("Failed to load lesson")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [pathSlug, sectionSlug, lessonSlug, user])

  const getLessonLink = (lesson: Lesson) => {
    if (section && section.lessons && section.lessons.some((l: any) => l._id === lesson._id)) {
      return `/paths/${pathSlug}/sections/${section.slug}/lessons/${lesson.slug}`
    }
    return `/paths/${pathSlug}/lessons/${lesson.slug}`
  }

  const getCurrentLessonIndex = () => {
    if (!lesson) return -1
    return allLessons.findIndex((l) => l._id === lesson._id)
  }

  const getPreviousLesson = () => {
    const currentIndex = getCurrentLessonIndex()
    if (currentIndex <= 0) return null
    return allLessons[currentIndex - 1]
  }

  const getNextLesson = () => {
    const currentIndex = getCurrentLessonIndex()
    if (currentIndex === -1 || currentIndex >= allLessons.length - 1) return null
    return allLessons[currentIndex + 1]
  }

  const previousLesson = getPreviousLesson()
  const nextLesson = getNextLesson()

  const handleMarkAsComplete = async () => {
    if (!lesson || !user) {
      toast.error("Authentication required", {
        description: "Please log in to track your progress."
      });
      return;
    }
    
    setCompletionLoading(true);
    try {
      const fakeCompletion = {
        _id: Math.random().toString(36),
        userId: String(user.id),
        lessonId: lesson._id
      };
      
      setLesson((prevLesson) => {
        if (!prevLesson) return null;
        return {
          ...prevLesson,
          completionStatus: fakeCompletion,
        };
      });
      
      try {
        const sidebarItems = document.querySelectorAll(`a[href*="${lessonSlug}"]`);
        sidebarItems.forEach(item => {
          item.classList.add('border-green-500');
          
          const iconSlot = item.querySelector('.mr-2');
          if (iconSlot) {
            const existingCheck = iconSlot.querySelector('svg');
            if (!existingCheck) {
              iconSlot.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-green-500"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>';
            }
          }
        });
      } catch (domError) {
      }
      
      await pathService.trackCompletion(lesson._id);
      
    } catch (error: any) {
    } finally {
      setCompletionLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(prevState => !prevState);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF]">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700 rounded w-3/4"></div>
            <div className="h-8 bg-gray-700 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1625]">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Link to={`/paths/${pathSlug}`}>
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to path
            </Button>
          </Link>
        </div>
      </div>
    )
  }
  if (!lesson) {
    return    
     <Link to="/" className="absolute top-6 left-6 z-20">
              <img src={logo} alt="logo" className="h-28 w-28" />
               </Link>
  }


  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-0 -z-10">
        <AnimatedBackground />
      </div>
      <Navbar />
      <div className="flex flex-1 relative">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleSidebar();
          }}
          data-sidebar-toggle
          className="md:hidden fixed bottom-4 right-4 z-30 bg-[#593797] text-white p-3 rounded-full shadow-lg"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(false);
            }}
          />
        )}

        {sidebarOpen && (
          <div 
            data-sidebar
            className="md:hidden fixed top-0 left-0 h-full z-20 w-[85%] max-w-[280px] bg-[#2e283c] border-r border-[#3d3450] overflow-y-auto"
          >
            <div className="text-xl font-bold text-[#f8f5ff] border-b border-[#3d3450] p-4 mb-2">
              {section?.title}
            </div>
            <div className="px-4 pb-4 overflow-y-auto">
              {section?.lessons?.map((sectionLesson: any, lessonIdx: number) => {
                const isCompleted = sectionLesson.completionStatus
                const isActive = lesson?._id === sectionLesson._id

                return (
                  <Link
                    key={sectionLesson._id}
                    to={`/paths/${pathSlug}/sections/${section.slug}/lessons/${sectionLesson.slug}`}
                    onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                    className={`flex items-center p-3 my-1 rounded-md transition-colors relative ${
                      isActive
                        ? "bg-[#1a1625] text-[#f8f5ff] font-medium border-l-4 border-[#593797]"
                        : isCompleted
                          ? "bg-[#3d3450] text-[#d4cce2] hover:bg-[#4a4358] border-l-4 border-green-500"
                          : "text-[#d4cce2] hover:bg-[#3d3450] border-l-4 border-transparent"
                    }`}
                  >
                    <div className="mr-2 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className={`opacity-70 ${isActive ? "text-white" : ""}`}>{sectionLesson.order === 99 ? "P" : lessonIdx + 1}.</span>
                      )}
                    </div>
                    <span className="truncate flex-1">{sectionLesson.title}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
        <main className="flex-1 p-4 md:p-8 bg-transparent text-[#d4cce2] overflow-x-hidden relative z-10">
          <div className="max-w-[900px] mx-0 md:ml-8 md:mr-[260px]">
            <div className="mb-6 md:mb-8">
              <div className="text-sm text-[#a9a1b9] flex items-center mb-2 overflow-x-auto whitespace-nowrap pb-2">
                <Link to={`/paths/${pathSlug}`} className="hover:text-white hover:underline">
                  {path?.title}
                </Link>
                <span className="mx-2">/</span>
                <Link to={`/paths/${pathSlug}/sections/${section.slug}`} className="hover:text-white hover:underline">
                  {section?.title}
                </Link>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-[#f8f5ff] mb-2">{lesson.title}</h1>

              <div className="flex flex-wrap items-center text-sm text-[#a9a1b9] mt-2 gap-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{lesson.estimatedMinutes} minutes</span>
                </div>
                {lesson.completionStatus && (
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>Completed</span>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden md:block fixed right-10 top-50% z-20 w-[220px]">
              <div className="text-lg font-bold text-[#f8f5ff] mb-4 pb-2 border-b border-[#3d3450]">
                {section?.title}
              </div>
              <div>
                {section?.lessons?.map((sectionLesson: any, lessonIdx: number) => {
                  const isCompleted = sectionLesson.completionStatus
                  const isActive = lesson?._id === sectionLesson._id

                  return (
                    <Link
                      key={sectionLesson._id}
                      to={`/paths/${pathSlug}/sections/${section.slug}/lessons/${sectionLesson.slug}`}
                      className={`flex items-center py-2 my-1 pr-2 transition-colors relative ${
                        isActive
                          ? "text-[#f8f5ff] font-medium border-r-4 border-[#593797]"
                          : isCompleted
                            ? "text-[#d4cce2] hover:text-white border-r-4 border-green-500"
                            : "text-[#a9a1b9] hover:text-[#d4cce2] border-r-4 border-transparent"
                      }`}
                    >
                      <div className="mr-2 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className={`opacity-70 ${isActive ? "text-white" : ""}`}>{sectionLesson.order === 99 ? "P" : lessonIdx + 1}.</span>
                        )}
                      </div>
                      <span className="truncate flex-1 text-sm">{sectionLesson.title}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

                <div className="overflow-x-auto">
                  <MarkdownContent content={lesson.content || ""} />
                </div>

                {user && (
                  <div className="mt-8 md:mt-10 pt-6 border-t border-[#3d3450]">
                    <Button
                      onClick={handleMarkAsComplete}
                      disabled={completionLoading || !!lesson.completionStatus}
                      className={`flex items-center gap-2 text-white w-full md:w-auto ${
                        lesson.completionStatus
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-[#593797] hover:bg-[#432970]"
                      }`}
                    >
                      {completionLoading ? (
                        <span className="animate-spin mr-1">◌</span>
                      ) : lesson.completionStatus ? (
                        <Check className="h-4 w-4 mr-1" />
                      ) : null}
                      {lesson.completionStatus ? "Completed!" : "Mark as Completed"}
                    </Button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 md:mt-12 pt-6 border-t border-[#3d3450]">
              {previousLesson ? (
                <Link to={getLessonLink(previousLesson)} className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="border-[#593797] text-white hover:bg-[#593797]/20 hover:text-white w-full sm:w-auto"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> 
                    <span className="truncate">{previousLesson.title}</span>
                  </Button>
                </Link>
              ) : (
                <div></div>
              )}
              {nextLesson && (
                <Link to={getLessonLink(nextLesson)} className="w-full sm:w-auto">
                  <Button className="bg-[#593797] hover:bg-[#432970] text-white w-full sm:w-auto">
                    <span className="truncate">{nextLesson.title}</span> 
                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}