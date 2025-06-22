
export const cleanPathDTO = (path: any) => {
  if (!path) return null;
  
  const cleanPath = {
    _id: path._id,
    title: path.title,
    slug: path.slug,
    description: path.description,
    imageUrl: path.imageUrl,
    estimatedHours: path.estimatedHours
  };
  
  return cleanPath;
};

export const cleanSectionDTO = (section: any) => {
  if (!section) return null;
  
  const cleanSection = {
    _id: section._id,
    title: section.title,
    slug: section.slug,
    description: section.description,
    estimatedHours: section.estimatedHours,
    order: section.order,
    pathId: section.pathId
  };
  
  return cleanSection;
};

export const cleanLessonDTO = (lesson: any) => {
  if (!lesson) return null;
  
  const cleanLesson = {
    _id: lesson._id,
    title: lesson.title,
    slug: lesson.slug,
    estimatedMinutes: lesson.estimatedMinutes,
    order: lesson.order,
    content: lesson.content,
    sectionId: lesson.sectionId
  };
  
  return cleanLesson;
};

export const mapToDTO = <T>(items: any[], mapperFn: (item: any) => T): T[] => {
  if (!items || !Array.isArray(items)) return [];
  return items.map(mapperFn);
}; 