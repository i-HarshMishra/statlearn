import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Convert self-rating (1-5) to normalized score (0-100)
 */
function selfRatingToScore(rating: number): number {
  const map: Record<number, number> = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 };
  return map[rating] || 0;
}

/**
 * Convert years of experience to score (0-100)
 */
function experienceToScore(years: number): number {
  if (years >= 10) return 100;
  if (years >= 5) return 75;
  if (years >= 2) return 50;
  return 20;
}

/**
 * Convert composite score (0-100) to level (1-3)
 */
function scoreToLevel(score: number): number {
  if (score >= 71) return 3; // Advanced
  if (score >= 41) return 2; // Intermediate
  return 1; // Beginner
}

/**
 * Determine gap severity
 */
function gapSeverity(gap: number): string {
  if (gap >= 2) return 'Critical';
  if (gap === 1) return 'Moderate';
  return 'No Gap';
}

/**
 * Calculate composite competency scores after diagnostic quiz submission
 */
export async function calculateCompetencyScores(
  profileId: string,
  diagnosticResults: Record<string, number>, // competencyName -> score (0-100)
): Promise<void> {
  const profile = await prisma.employeeProfile.findUnique({
    where: { id: profileId },
    include: {
      skillRatings: { include: { competency: true } },
      user: true,
    },
  });

  if (!profile) throw new Error('Profile not found');

  // Get benchmarks for this designation
  const benchmarks = await prisma.roleBenchmark.findMany({
    where: { designation: profile.designation },
    include: { competency: true },
  });

  if (benchmarks.length === 0) {
    // No benchmarks for this designation, use all competencies with level 2
    const allCompetencies = await prisma.competency.findMany();
    for (const comp of allCompetencies) {
      if (diagnosticResults[comp.name] !== undefined || profile.skillRatings.some(sr => sr.competencyId === comp.id)) {
        await processCompetencyScore(
          profileId, comp.id, comp.name, 2,
          diagnosticResults, profile
        );
      }
    }
  } else {
    for (const benchmark of benchmarks) {
      await processCompetencyScore(
        profileId, benchmark.competencyId, benchmark.competency.name,
        benchmark.requiredLevel, diagnosticResults, profile
      );
    }
  }

  // Recalculate overall readiness
  await recalculateReadiness(profileId);
}

async function processCompetencyScore(
  profileId: string,
  competencyId: string,
  competencyName: string,
  requiredLevel: number,
  diagnosticResults: Record<string, number>,
  profile: any,
): Promise<void> {
  // 1. Diagnostic score
  const hasDiagnostic = diagnosticResults[competencyName] !== undefined;
  const diagnosticScore = hasDiagnostic ? diagnosticResults[competencyName] : null;

  // 2. Self rating score
  const selfRating = profile.skillRatings.find(
    (sr: any) => sr.competencyId === competencyId
  );
  const selfScore = selfRating ? selfRatingToScore(selfRating.rating) : 0;

  // 3. Training score
  const previousTrainings = (profile.previousTrainings || '').toLowerCase();
  const hasRelatedTraining = previousTrainings.includes(competencyName.toLowerCase()) ||
    previousTrainings.includes(competencyName.split('/')[0].toLowerCase());
  const trainingScore = hasRelatedTraining ? 100 : 0;

  // 4. Experience score
  const experienceScore = experienceToScore(profile.experienceYears);

  // Composite score
  let compositeScore = 0;
  if (hasDiagnostic) {
    compositeScore = Math.round(
      (0.50 * diagnosticScore! +
       0.20 * selfScore +
       0.20 * trainingScore +
       0.10 * experienceScore) * 100
    ) / 100;
  } else {
    compositeScore = Math.round(
      (0.40 * selfScore +
       0.30 * trainingScore +
       0.30 * experienceScore) * 100
    ) / 100;
  }

  const currentLevel = scoreToLevel(compositeScore);
  const gap = Math.max(requiredLevel - currentLevel, 0);
  const severity = gapSeverity(gap);

  // Upsert competency score
  await prisma.competencyScore.upsert({
    where: { profileId_competencyId: { profileId, competencyId } },
    update: {
      score: compositeScore,
      currentLevel,
      diagnosticScore,
      selfScore,
      trainingScore,
      experienceScore,
    },
    create: {
      profileId,
      competencyId,
      score: compositeScore,
      currentLevel,
      diagnosticScore,
      selfScore,
      trainingScore,
      experienceScore,
    },
  });

  // Upsert skill gap
  await prisma.skillGap.upsert({
    where: { profileId_competencyId: { profileId, competencyId } },
    update: { requiredLevel, currentLevel, gap, severity },
    create: { profileId, competencyId, requiredLevel, currentLevel, gap, severity },
  });
}

/**
 * Recalculate overall readiness for a profile
 */
export async function recalculateReadiness(profileId: string): Promise<number> {
  const profile = await prisma.employeeProfile.findUnique({
    where: { id: profileId },
  });
  if (!profile) return 0;

  const benchmarks = await prisma.roleBenchmark.findMany({
    where: { designation: profile.designation },
  });

  let overallReadiness = 0;

  if (benchmarks.length > 0) {
    // Benchmark-based readiness: compare current level vs required level
    const scores = await prisma.competencyScore.findMany({
      where: {
        profileId,
        competencyId: { in: benchmarks.map(b => b.competencyId) },
      },
    });

    let readinessSum = 0;
    let readinessCount = 0;

    for (const benchmark of benchmarks) {
      if (benchmark.requiredLevel === 0) continue;
      const score = scores.find(s => s.competencyId === benchmark.competencyId);
      const currentLevel = score?.currentLevel || 1;
      const readiness = Math.min(currentLevel / benchmark.requiredLevel, 1) * 100;
      readinessSum += readiness;
      readinessCount++;
    }

    overallReadiness = readinessCount > 0
      ? Math.round((readinessSum / readinessCount) * 100) / 100
      : 0;
  } else {
    // Fallback: no benchmarks for this designation — use average score directly
    const allScores = await prisma.competencyScore.findMany({
      where: { profileId },
    });

    if (allScores.length > 0) {
      const avgScore = allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length;
      overallReadiness = Math.round(avgScore * 100) / 100;
    }
  }

  await prisma.employeeProfile.update({
    where: { id: profileId },
    data: { overallReadiness },
  });

  return overallReadiness;
}

/**
 * Update competency score after course completion
 */
export async function updateScoreAfterCourseCompletion(
  profileId: string,
  courseId: string,
): Promise<void> {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return;

  const tags = course.competencyTags.split(',').map(t => t.trim());
  const competencies = await prisma.competency.findMany({
    where: { name: { in: tags } },
  });

  for (const comp of competencies) {
    const existing = await prisma.competencyScore.findUnique({
      where: { profileId_competencyId: { profileId, competencyId: comp.id } },
    });

    const oldScore = existing?.score || 30;
    const newScore = Math.min(oldScore + 10, 100);
    const newLevel = scoreToLevel(newScore);

    await prisma.competencyScore.upsert({
      where: { profileId_competencyId: { profileId, competencyId: comp.id } },
      update: { score: newScore, currentLevel: newLevel },
      create: {
        profileId,
        competencyId: comp.id,
        score: newScore,
        currentLevel: newLevel,
      },
    });

    // Update skill gap
    const benchmark = await prisma.roleBenchmark.findFirst({
      where: {
        competencyId: comp.id,
        designation: (await prisma.employeeProfile.findUnique({ where: { id: profileId } }))?.designation || '',
      },
    });

    if (benchmark) {
      const gap = Math.max(benchmark.requiredLevel - newLevel, 0);
      await prisma.skillGap.upsert({
        where: { profileId_competencyId: { profileId, competencyId: comp.id } },
        update: { currentLevel: newLevel, gap, severity: gapSeverity(gap) },
        create: {
          profileId,
          competencyId: comp.id,
          requiredLevel: benchmark.requiredLevel,
          currentLevel: newLevel,
          gap,
          severity: gapSeverity(gap),
        },
      });
    }
  }

  // Update learning hours
  await prisma.employeeProfile.update({
    where: { id: profileId },
    data: {
      totalLearningHours: { increment: course.durationHours },
    },
  });

  await recalculateReadiness(profileId);
}

/**
 * Update competency score after quiz attempt
 */
export async function updateScoreAfterQuiz(
  profileId: string,
  competencyName: string,
  quizScorePercent: number,
): Promise<void> {
  const competency = await prisma.competency.findUnique({
    where: { name: competencyName },
  });
  if (!competency) return;

  const existing = await prisma.competencyScore.findUnique({
    where: { profileId_competencyId: { profileId, competencyId: competency.id } },
  });

  if (existing) {
    const newScore = Math.round((0.7 * existing.score + 0.3 * quizScorePercent) * 100) / 100;
    const newLevel = scoreToLevel(newScore);

    await prisma.competencyScore.update({
      where: { profileId_competencyId: { profileId, competencyId: competency.id } },
      data: { score: newScore, currentLevel: newLevel },
    });

    // Update gap
    const profile = await prisma.employeeProfile.findUnique({ where: { id: profileId } });
    const benchmark = await prisma.roleBenchmark.findFirst({
      where: { competencyId: competency.id, designation: profile?.designation || '' },
    });

    if (benchmark) {
      const gap = Math.max(benchmark.requiredLevel - newLevel, 0);
      await prisma.skillGap.upsert({
        where: { profileId_competencyId: { profileId, competencyId: competency.id } },
        update: { currentLevel: newLevel, gap, severity: gapSeverity(gap) },
        create: {
          profileId,
          competencyId: competency.id,
          requiredLevel: benchmark.requiredLevel,
          currentLevel: newLevel,
          gap,
          severity: gapSeverity(gap),
        },
      });
    }

    await recalculateReadiness(profileId);
  }
}
