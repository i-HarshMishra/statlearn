import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { calculateCompetencyScores } from '../services/competency.service';
import { generateFallbackText } from '../utils/gemini';

const prisma = new PrismaClient();

/**
 * Call Gemini to generate a professional summary based on profile and gaps.
 */
async function generateProfileSummary(
  fullName: string,
  designation: string,
  department: string,
  topSkills: string[],
  criticalGaps: string[]
): Promise<string> {
  const prompt = `You are a professional HR advisor for the Ministry of Statistics and Programme Implementation (MoSPI).
Write a professional, encouraging 3-sentence profile summary for the following employee.

Name: ${fullName}
Role: ${designation} at ${department}
Top Strengths: ${topSkills.length > 0 ? topSkills.join(', ') : 'General foundational skills'}
Areas Needing Improvement (Critical Gaps): ${criticalGaps.length > 0 ? criticalGaps.join(', ') : 'None'}

The summary should highlight their strengths and gently frame their gaps as exciting opportunities for capacity building in their statistical career. Do NOT use bullet points. Write only the 3 sentences.`;

  try {
    const resultText = await generateFallbackText(prompt, false);
    if (resultText) return resultText.trim();
  } catch (err: any) {
    console.error(`Profile summary generation failed:`, err.message);
  }

  // Fallback
  let fallback = `${fullName} is a dedicated ${designation} serving in the ${department}. `;
  if (topSkills.length > 0) {
    fallback += `They demonstrate strong capabilities in areas like ${topSkills.slice(0, 2).join(' and ')}. `;
  }
  if (criticalGaps.length > 0) {
    fallback += `By focusing capacity building efforts on ${criticalGaps[0]}, they are well-positioned to significantly advance their professional contribution to India's statistical system.`;
  } else {
    fallback += `They are currently well-aligned with all core competency requirements for their role.`;
  }
  return fallback;
}

/**
 * GET /api/diagnostic/questions
 * Returns diagnostic questions based on user's designation
 */
export async function getDiagnosticQuestions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.employeeProfile.findUnique({ where: { userId } });

    if (!profile) {
      res.status(400).json({ error: 'Complete onboarding first' });
      return;
    }

    // Get benchmarks for designation to know which competencies to test
    const benchmarks = await prisma.roleBenchmark.findMany({
      where: { designation: profile.designation },
      include: { competency: true },
    });

    const competencyNames = benchmarks.map(b => b.competency.name);

    // Get questions matching these competencies
    let questions = await prisma.diagnosticQuestion.findMany({
      where: {
        competency: { in: competencyNames },
      },
    });

    // If not enough questions, get all
    if (questions.length < 5) {
      questions = await prisma.diagnosticQuestion.findMany();
    }

    // Shuffle and limit to reasonable count
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 15);

    // Don't send correct answers to frontend
    const safeQuestions = shuffled.map(q => ({
      id: q.id,
      questionText: q.questionText,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      competency: q.competency,
      difficulty: q.difficulty,
    }));

    res.json({
      questions: safeQuestions,
      totalQuestions: safeQuestions.length,
      designation: profile.designation,
    });
  } catch (error) {
    console.error('Get diagnostic questions error:', error);
    res.status(500).json({ error: 'Failed to get diagnostic questions' });
  }
}

/**
 * POST /api/diagnostic/submit
 * Submit diagnostic quiz answers and calculate scores
 */
export async function submitDiagnostic(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { answers } = req.body; // { questionId: selectedAnswer }

    const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(400).json({ error: 'Complete onboarding first' });
      return;
    }

    // Get question details
    const questionIds = Object.keys(answers);
    const questions = await prisma.diagnosticQuestion.findMany({
      where: { id: { in: questionIds } },
    });

    // Score per competency
    const competencyCorrect: Record<string, number> = {};
    const competencyTotal: Record<string, number> = {};
    let totalCorrect = 0;

    for (const question of questions) {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;

      if (!competencyTotal[question.competency]) {
        competencyTotal[question.competency] = 0;
        competencyCorrect[question.competency] = 0;
      }

      competencyTotal[question.competency]++;
      if (isCorrect) {
        competencyCorrect[question.competency]++;
        totalCorrect++;
      }
    }

    // Convert to score (0-100) per competency
    const diagnosticResults: Record<string, number> = {};
    for (const comp of Object.keys(competencyTotal)) {
      diagnosticResults[comp] = Math.round(
        (competencyCorrect[comp] / competencyTotal[comp]) * 100
      );
    }

    // Calculate composite competency scores
    await calculateCompetencyScores(profile.id, diagnosticResults);

    // Build detailed results
    const results = questions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      correctAnswer: q.correctAnswer,
      userAnswer: answers[q.id],
      isCorrect: answers[q.id] === q.correctAnswer,
      explanation: q.explanation,
      competency: q.competency,
    }));

    // Get updated scores
    const updatedScores = await prisma.competencyScore.findMany({
      where: { profileId: profile.id },
      include: { competency: true },
    });

    const updatedGaps = await prisma.skillGap.findMany({
      where: { profileId: profile.id },
      include: { competency: true },
    });

    // Generate AI Profile Summary
    const topSkills = updatedScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.competency.name);
      
    const criticalGaps = updatedGaps
      .filter(g => g.severity === 'Critical')
      .map(g => g.competency.name);

    const profileSummary = await generateProfileSummary(
      profile.fullName,
      profile.designation,
      profile.department,
      topSkills,
      criticalGaps
    );

    // Save summary
    await prisma.employeeProfile.update({
      where: { id: profile.id },
      data: { profileSummary },
    });

    // Re-fetch profile to get the latest overallReadiness (updated by recalculateReadiness)
    const updatedProfile = await prisma.employeeProfile.findUnique({
      where: { id: profile.id },
    });

    res.json({
      totalQuestions: questions.length,
      correctAnswers: totalCorrect,
      scorePercent: Math.round((totalCorrect / questions.length) * 100),
      diagnosticResults,
      results,
      competencyScores: updatedScores,
      skillGaps: updatedGaps,
      overallReadiness: updatedProfile?.overallReadiness || 0,
      profileSummary: updatedProfile?.profileSummary,
    });
  } catch (error) {
    console.error('Submit diagnostic error:', error);
    res.status(500).json({ error: 'Failed to submit diagnostic' });
  }
}
