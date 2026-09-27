import { PrismaClient } from '@prisma/client';
import { generateFallbackText } from '../utils/gemini';

const prisma = new PrismaClient();

interface CourseRecommendation {
  id: string;
  title: string;
  provider: string;
  description: string | null;
  level: string;
  durationHours: number;
  language: string | null;
  url: string | null;
  competencyTags: string;
  gapSeverity: string;
  matchedCompetency: string;
  priority: number;
  status?: string;
  matchedVia?: string;
  source?: string;
}

async function getSemanticMatches(competency: any, courses: any[]) {
  const existingMatches = await prisma.competencyCourseMatch.findMany({
    where: { competencyId: competency.id }
  });

  if (existingMatches.length > 0) {
    return existingMatches;
  }

  const prompt = `
You are an AI learning coordinator.
Competency: ${competency.name} (Domain: ${competency.domain})
Description: ${competency.description || 'N/A'}

Available courses (ID, Title, Tags):
${courses.map(c => `${c.id} | ${c.title} | ${c.competencyTags}`).join('\n')}

Identify the most relevant courses for this competency based on semantic meaning.
Return a JSON array of objects with exactly this structure:
[
  { "courseId": "id-here", "relevanceScore": 85 }
]
Only include courses with relevanceScore >= 60.
`;

  try {
    const resultText = await generateFallbackText(prompt, true);
    const cleaned = resultText.replace(/```json\s*|\s*```/g, '');
    const matches = JSON.parse(cleaned || '[]');
    
    const savedMatches = [];
    for (const match of matches) {
      if (!courses.find(c => c.id === match.courseId)) continue;
      
      const saved = await prisma.competencyCourseMatch.create({
        data: {
          competencyId: competency.id,
          courseId: match.courseId,
          relevanceScore: match.relevanceScore || 80,
          matchedVia: 'semantic'
        }
      });
      savedMatches.push(saved);
    }
    return savedMatches;
  } catch (err) {
    console.error('Semantic match failed:', err);
    return [];
  }
}

/**
 * Get personalized course recommendations based on skill gaps
 */
export async function getRecommendations(profileId: string): Promise<CourseRecommendation[]> {
  const profile = await prisma.employeeProfile.findUnique({
    where: { id: profileId },
  });
  if (!profile) return [];

  // Get skill gaps sorted by severity
  const gaps = await prisma.skillGap.findMany({
    where: {
      profileId,
      gap: { gt: 0 },
    },
    include: { competency: true },
    orderBy: { gap: 'desc' },
  });

  if (gaps.length === 0) return [];

  // Get all courses
  const dbCourses = await prisma.course.findMany();
  
  // Get all mapped NSSTA programmes and adapt them to course shape
  const nsstaProgrammes = await prisma.nSSTATrainingProgramme.findMany({
    where: { competencyTags: { not: '' } }
  });
  
  const nsstaAdapted = nsstaProgrammes.map(p => ({
    id: p.id,
    title: p.title,
    provider: 'NSSTA TPAC',
    description: `Topic: ${p.topic || 'N/A'}. Target: ${p.targetAudience || 'Any'}. Venue: ${p.venue || 'N/A'}. Dates: ${p.weekOrDate || 'TBD'}`,
    level: 'Advanced', // NSSTA tends to be intermediate/advanced
    durationHours: (p.durationDays || 3) * 6,
    language: 'English',
    url: null,
    competencyTags: p.competencyTags || '',
    source: 'ingested'
  }));

  const courses = [...dbCourses.map(c => ({ ...c, source: 'seed' })), ...nsstaAdapted];

  // Get course progress for this profile
  const progress = await prisma.courseProgress.findMany({
    where: { profileId },
  });
  const progressMap = new Map(progress.map(p => [p.courseId, p.status]));

  const recommendations: CourseRecommendation[] = [];
  const usedCourseIds = new Set<string>();

  // Severity priority: Critical > Moderate
  const severityOrder: Record<string, number> = { 'Critical': 0, 'Moderate': 1 };

  for (const gap of gaps) {
    let matchedVia = 'exact';
    let matchingCourses = courses.filter(course => {
      const tags = course.competencyTags.split(',').map(t => t.trim().toLowerCase());
      return tags.includes(gap.competency.name.toLowerCase());
    });

    if (matchingCourses.length === 0) {
      matchedVia = 'semantic';
      const semanticMatches = await getSemanticMatches(gap.competency, courses);
      matchingCourses = semanticMatches
        .map(sm => courses.find(c => c.id === sm.courseId)!)
        .filter(Boolean);
    }

    // Determine appropriate course level based on current level
    const levelPriority = getLevelPriority(gap.currentLevel);

    // Sort matching courses
    const sorted = matchingCourses.sort((a, b) => {
      // Prefer matching level
      const aLevelMatch = levelPriority.indexOf(a.level) >= 0 ? levelPriority.indexOf(a.level) : 99;
      const bLevelMatch = levelPriority.indexOf(b.level) >= 0 ? levelPriority.indexOf(b.level) : 99;
      if (aLevelMatch !== bLevelMatch) return aLevelMatch - bLevelMatch;

      // Prefer iGOT
      if (a.provider !== b.provider) {
        if (a.provider.includes('iGOT')) return -1;
        if (b.provider.includes('iGOT')) return 1;
      }

      // Prefer shorter duration
      return a.durationHours - b.durationHours;
    });

    for (const course of sorted) {
      if (usedCourseIds.has(course.id)) continue;
      usedCourseIds.add(course.id);

      const severityPriority = severityOrder[gap.severity] ?? 2;

      recommendations.push({
        ...course,
        gapSeverity: gap.severity,
        matchedCompetency: gap.competency.name,
        priority: severityPriority * 100 + (100 - gap.gap * 33),
        status: progressMap.get(course.id) || 'recommended',
        matchedVia,
      });
    }
  }

  // Sort by priority (lower = higher priority)
  recommendations.sort((a, b) => a.priority - b.priority);

  return recommendations;
}

function getLevelPriority(currentLevel: number): string[] {
  switch (currentLevel) {
    case 1: return ['Beginner', 'Intermediate'];
    case 2: return ['Intermediate', 'Advanced'];
    case 3: return ['Advanced'];
    default: return ['Beginner', 'Intermediate', 'Advanced'];
  }
}
