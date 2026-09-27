import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import pdfParse from 'pdf-parse';
// @ts-ignore
import { parseOfficeAsync } from 'officeparser';
import { ingestNSSTAProgrammes } from '../services/nssta-ingest.service';
import { generateQuizFromText, generateFallbackText } from '../utils/gemini';

const prisma = new PrismaClient();

/**
 * Call Gemini to predict future skills based on aggregated gap data.
 * Returns an array of { skill, rationale } objects.
 * Falls back to a hardcoded response if the LLM call fails so the demo never breaks.
 */
async function predictFutureSkills(
  gapsByDomainSeverity: Record<string, Record<string, number>>,
  domainDistribution: { domain: string; avgScore: number }[],
): Promise<{ skill: string; rationale: string }[]> {
  const prompt = `You are a workforce planning AI advisor for MoSPI (Ministry of Statistics and Programme Implementation), Government of India.

Based on these current officer skill gaps grouped by domain and severity:
${JSON.stringify(gapsByDomainSeverity, null, 2)}

And these domain-wide average competency scores (out of 100):
${domainDistribution.map(d => `${d.domain}: ${d.avgScore}/100`).join(', ')}

Predict the top 3 emerging technical/statistical skills that MoSPI officers will most critically need over the next 2 years, considering India's digital transformation, the adoption of AI/ML in official statistics, and global trends in data governance.

Return ONLY a JSON array of exactly 3 objects:
[
  { "skill": "Skill Name", "rationale": "One-line rationale" }
]`;

  try {
    const resultText = await generateFallbackText(prompt, true);
    if (resultText) {
      // Clean possible markdown code blocks from Groq
      const cleaned = resultText.replace(/```json\s*|\s*```/g, '');
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 3);
    }
  } catch (err: any) {
    console.error(`Forecast generation failed:`, err.message);
  }

  // Hardcoded fallback so the demo never shows an empty card
  return [
    { skill: 'AI/ML for Official Statistics', rationale: 'Rapid adoption of machine learning for data imputation, anomaly detection, and nowcasting in national surveys demands AI-literate statistical officers.' },
    { skill: 'Cloud-Native Data Engineering', rationale: 'Migration of government data systems to MeghRaj/GovCloud requires officers skilled in cloud-native ETL pipelines and serverless architectures.' },
    { skill: 'Privacy-Preserving Analytics', rationale: 'The Digital Personal Data Protection Act 2023 necessitates competencies in differential privacy, synthetic data, and federated learning for statistical disclosure control.' },
  ];
}

/**
 * GET /api/admin/dashboard
 */
export async function getAdminDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const profiles = await prisma.employeeProfile.findMany({
      include: {
        competencyScores: { include: { competency: true } },
        skillGaps: { include: { competency: true } },
      },
    });

    const totalEmployees = profiles.length;
    const avgReadiness = totalEmployees > 0
      ? Math.round(profiles.reduce((sum, p) => sum + (p.overallReadiness || 0), 0) / totalEmployees)
      : 0;

    const highReadiness = profiles.filter(p => (p.overallReadiness || 0) >= 80).length;
    const lowReadiness = profiles.filter(p => (p.overallReadiness || 0) < 50).length;

    // All skill gaps
    const allGaps = profiles.flatMap(p => p.skillGaps);
    const criticalGaps = allGaps.filter(g => g.severity === 'Critical').length;

    // Total trainings (count completed course progress)
    const completedCourses = await prisma.courseProgress.count({
      where: { status: 'completed' },
    });

    // Designation-wise readiness
    const designationMap: Record<string, { total: number; sum: number; count: number }> = {};
    for (const p of profiles) {
      if (!designationMap[p.designation]) {
        designationMap[p.designation] = { total: 0, sum: 0, count: 0 };
      }
      designationMap[p.designation].total++;
      designationMap[p.designation].sum += p.overallReadiness || 0;
      designationMap[p.designation].count++;
    }
    const designationReadiness = Object.entries(designationMap).map(([name, data]) => ({
      designation: name,
      avgReadiness: Math.round(data.sum / data.count),
      count: data.total,
    }));

    // Department-wise readiness
    const deptMap: Record<string, { sum: number; count: number }> = {};
    for (const p of profiles) {
      if (!deptMap[p.department]) deptMap[p.department] = { sum: 0, count: 0 };
      deptMap[p.department].sum += p.overallReadiness || 0;
      deptMap[p.department].count++;
    }
    const departmentReadiness = Object.entries(deptMap).map(([name, data]) => ({
      department: name,
      avgReadiness: Math.round(data.sum / data.count),
      count: data.count,
    }));

    // Critical gaps by competency
    const gapByComp: Record<string, number> = {};
    for (const g of allGaps) {
      if (g.severity === 'Critical') {
        const name = g.competency.name;
        gapByComp[name] = (gapByComp[name] || 0) + 1;
      }
    }
    const criticalGapsByComp = Object.entries(gapByComp)
      .map(([competency, count]) => ({ competency, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Domain competency distribution
    const domainScores: Record<string, { sum: number; count: number }> = {};
    for (const p of profiles) {
      for (const cs of p.competencyScores) {
        const domain = cs.competency.domain;
        if (!domainScores[domain]) domainScores[domain] = { sum: 0, count: 0 };
        domainScores[domain].sum += cs.score;
        domainScores[domain].count++;
      }
    }
    const domainDistribution = Object.entries(domainScores).map(([domain, data]) => ({
      domain,
      avgScore: Math.round(data.sum / data.count),
    }));

    const totalCompetencies = await prisma.competency.count();
    const totalBenchmarks = await prisma.roleBenchmark.count();
    const totalCourses = await prisma.course.count();
    const totalUsers = await prisma.user.count();

    // ── Predictive Analytics: Future Skills Forecast ──────────────────
    // Aggregate skill gaps by domain and severity
    const gapsByDomainSeverity: Record<string, Record<string, number>> = {};
    for (const g of allGaps) {
      const domain = g.competency.domain;
      if (!gapsByDomainSeverity[domain]) gapsByDomainSeverity[domain] = {};
      gapsByDomainSeverity[domain][g.severity] = (gapsByDomainSeverity[domain][g.severity] || 0) + 1;
    }

    const futureSkillsForecast = await predictFutureSkills(gapsByDomainSeverity, domainDistribution);

    res.json({
      stats: {
        totalEmployees, avgReadiness, highReadiness, lowReadiness,
        criticalGaps, completedTrainings: completedCourses,
        totalCompetencies, totalBenchmarks, totalCourses, totalUsers
      },
      designationReadiness,
      departmentReadiness,
      criticalGapsByComp,
      domainDistribution,
      futureSkillsForecast,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
}

/**
 * GET /api/admin/employees
 */
export async function getEmployees(req: AuthRequest, res: Response): Promise<void> {
  try {
    const profiles = await prisma.employeeProfile.findMany({
      include: {
        skillGaps: true,
        user: { select: { email: true } },
      },
      orderBy: { overallReadiness: 'desc' },
    });

    res.json({
      employees: profiles.map(p => ({
        id: p.id,
        fullName: p.fullName,
        email: p.user.email,
        designation: p.designation,
        department: p.department,
        location: p.location,
        experienceYears: p.experienceYears,
        overallReadiness: p.overallReadiness,
        criticalGaps: p.skillGaps.filter(g => g.severity === 'Critical').length,
        moderateGaps: p.skillGaps.filter(g => g.severity === 'Moderate').length,
        totalLearningHours: p.totalLearningHours,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load employees' });
  }
}

/**
 * GET /api/admin/designation-readiness
 */
export async function getDesignationReadiness(req: AuthRequest, res: Response): Promise<void> {
  try {
    const profiles = await prisma.employeeProfile.findMany({
      include: {
        competencyScores: { include: { competency: true } },
        skillGaps: { include: { competency: true } },
      },
    });

    const benchmarks = await prisma.roleBenchmark.findMany({
      include: { competency: true },
    });

    // Group by designation
    const byDesignation: Record<string, any> = {};

    for (const p of profiles) {
      if (!byDesignation[p.designation]) {
        byDesignation[p.designation] = {
          designation: p.designation,
          employees: [],
          benchmarks: benchmarks
            .filter(b => b.designation === p.designation)
            .map(b => ({
              competency: b.competency.name,
              domain: b.competency.domain,
              requiredLevel: b.requiredLevel,
            })),
        };
      }
      byDesignation[p.designation].employees.push({
        name: p.fullName,
        readiness: p.overallReadiness,
        criticalGaps: p.skillGaps.filter(g => g.severity === 'Critical').length,
      });
    }

    res.json({
      designations: Object.values(byDesignation),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load designation readiness' });
  }
}

/**
 * GET /api/admin/talent-search?competency=xxx&minLevel=2
 */
export async function talentSearch(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { competency, level } = req.query;

    if (!competency) {
      // Return each employee exactly once based on overall readiness
      let profiles = await prisma.employeeProfile.findMany({
        orderBy: { overallReadiness: 'desc' },
      });

      let results = profiles.map(p => {
        const computedLevel = p.overallReadiness >= 75 ? 3 : p.overallReadiness >= 50 ? 2 : 1;
        return {
          name: p.fullName,
          designation: p.designation,
          department: p.department,
          location: p.location,
          competency: 'Overall Readiness',
          domain: 'General',
          score: p.overallReadiness,
          level: computedLevel,
        };
      });

      if (level) {
        results = results.filter(r => r.level === parseInt(level as string));
      }

      res.json({ results });
      return;
    }

    let where: any = {};
    where.competency = { name: { contains: competency as string } };
    
    if (level) {
      where.currentLevel = parseInt(level as string);
    }

    const scores = await prisma.competencyScore.findMany({
      where,
      include: {
        competency: true,
        profile: {
          select: { fullName: true, designation: true, department: true, location: true },
        },
      },
      orderBy: { score: 'desc' },
      take: 500,
    });

    res.json({
      results: scores.map(s => ({
        name: s.profile.fullName,
        designation: s.profile.designation,
        department: s.profile.department,
        location: s.profile.location,
        competency: s.competency.name,
        domain: s.competency.domain,
        score: s.score,
        level: s.currentLevel,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search' });
  }
}

// ─── Competency CRUD ─────────────────────────────────────────────

export async function getCompetencies(req: AuthRequest, res: Response): Promise<void> {
  try {
    const competencies = await prisma.competency.findMany({ orderBy: { domain: 'asc' } });
    res.json({ competencies });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load competencies' });
  }
}

export async function createCompetency(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, domain, description } = req.body;
    if (!name || !domain) { res.status(400).json({ error: 'Name and domain required' }); return; }
    const competency = await prisma.competency.create({ data: { name, domain, description } });
    res.json({ competency });
  } catch (error: any) {
    if (error.code === 'P2002') { res.status(400).json({ error: 'Competency name already exists' }); return; }
    res.status(500).json({ error: 'Failed to create competency' });
  }
}

export async function updateCompetency(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, domain, description } = req.body;
    const competency = await prisma.competency.update({ where: { id }, data: { name, domain, description } });
    res.json({ competency });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update competency' });
  }
}

export async function deleteCompetency(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.competency.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete competency' });
  }
}

// ─── Benchmark CRUD ──────────────────────────────────────────────

export async function getBenchmarks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const benchmarks = await prisma.roleBenchmark.findMany({
      include: { competency: true },
      orderBy: { designation: 'asc' },
    });
    res.json({ benchmarks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load benchmarks' });
  }
}

export async function createBenchmark(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { designation, competencyId, requiredLevel } = req.body;
    if (!designation || !competencyId) { res.status(400).json({ error: 'Designation and competency required' }); return; }
    const benchmark = await prisma.roleBenchmark.create({
      data: { designation, competencyId, requiredLevel: parseInt(requiredLevel) || 2 },
      include: { competency: true },
    });
    res.json({ benchmark });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create benchmark' });
  }
}

export async function deleteBenchmark(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.roleBenchmark.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete benchmark' });
  }
}

// ─── Course CRUD ─────────────────────────────────────────────────

export async function getCourses(req: AuthRequest, res: Response): Promise<void> {
  try {
    const courses = await prisma.course.findMany({ orderBy: { title: 'asc' } });
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load courses' });
  }
}

export async function createCourse(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, provider, description, level, durationHours, language, url, competencyTags } = req.body;
    if (!title || !provider) { res.status(400).json({ error: 'Title and provider required' }); return; }
    const course = await prisma.course.create({
      data: {
        title, provider, description, level: level || 'Beginner',
        durationHours: parseFloat(durationHours) || 2,
        language: language || 'English', url, competencyTags: competencyTags || '',
      },
    });
    res.json({ course });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create course' });
  }
}

export async function deleteCourse(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
}

// ─── User Management ─────────────────────────────────────────────

export async function getUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, role: true, createdAt: true,
        employeeProfile: { select: { fullName: true, designation: true, department: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Map employeeProfile to profile for the frontend
    const mappedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      profile: u.employeeProfile,
    }));
    
    res.json({ users: mappedUsers });
  } catch (error) {
    console.error('Failed to load users:', error);
    res.status(500).json({ error: 'Failed to load users' });
  }
}

export async function updateUserRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['LEARNER', 'ADMIN'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' }); return;
    }
    await prisma.user.update({ where: { id }, data: { role } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
}

// ─── Content & Quiz Management ─────────────────────────────────────────────

export async function extractTextFromDocument(req: AuthRequest, res: Response): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    let extractedText = '';

    if (file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(file.buffer);
      extractedText = pdfData.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      extractedText = await parseOfficeAsync(file.buffer);
    } else if (file.mimetype === 'text/plain') {
      extractedText = file.buffer.toString('utf-8');
    } else {
      res.status(400).json({ error: 'Unsupported file type. Please upload a PDF, PPTX or TXT file.' });
      return;
    }

    if (!extractedText || extractedText.trim().length < 50) {
      res.status(400).json({ error: 'Not enough text extracted from the file.' });
      return;
    }

    res.json({ success: true, text: extractedText });
  } catch (error: any) {
    console.error('Text extraction error:', error);
    res.status(500).json({ error: 'Failed to extract text from file' });
  }
}

export async function uploadMaterial(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { title, content, contentType } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const material = await prisma.material.create({
      data: {
        title,
        content,
        contentType: contentType || 'text',
        uploadedById: userId,
      },
    });

    res.json({ success: true, material });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload material' });
  }
}

export async function generateQuiz(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { materialId, title, competency, difficulty, questionCount } = req.body;

    if (!materialId) {
      res.status(400).json({ error: 'materialId is required' });
      return;
    }

    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (!material) {
      res.status(404).json({ error: 'Material not found' });
      return;
    }

    const comp = competency || 'General';
    const diff = difficulty || 'Medium';
    const count = parseInt(questionCount) || 5;

    let generatedQuestions;
    try {
      generatedQuestions = await generateQuizFromText(material.content, comp, diff, count);
    } catch (llmError) {
      console.error('LLM Quiz Generation Failed:', llmError);
      res.status(500).json({ error: 'AI failed to generate quiz.' });
      return;
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: title || `Quiz: ${material.title}`,
        competency: comp,
        difficulty: diff,
        materialId: material.id,
        createdById: userId,
        published: false,
        questions: {
          create: generatedQuestions.map((q: any) => ({
            questionText: q.questionText,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty || diff,
            competency: q.competency || comp,
            bloomsLevel: q.bloomsLevel || 'Apply',
          })),
        },
      },
      include: { questions: true },
    });

    res.json({ success: true, quiz });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
}

export async function getMaterials(req: AuthRequest, res: Response): Promise<void> {
  try {
    const materials = await prisma.material.findMany({
      include: { quizzes: { select: { id: true, title: true, published: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ materials });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load materials' });
  }
}

export async function getQuizzes(req: AuthRequest, res: Response): Promise<void> {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        questions: { select: { id: true } },
        material: { select: { title: true } },
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      quizzes: quizzes.map(q => ({
        id: q.id, title: q.title, competency: q.competency,
        difficulty: q.difficulty, published: q.published,
        materialTitle: q.material?.title,
        questionCount: q.questions.length,
        attemptCount: q._count.attempts,
        createdAt: q.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load quizzes' });
  }
}

export async function publishQuiz(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { quizId } = req.params;
    await prisma.quiz.update({
      where: { id: quizId },
      data: { published: true },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish quiz' });
  }
}

export async function getQuizAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { quizId } = req.params;
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        attempts: {
          include: { profile: { select: { fullName: true } } },
          orderBy: { attemptedAt: 'desc' },
        },
      },
    });

    if (!quiz) { res.status(404).json({ error: 'Quiz not found' }); return; }

    const avgScore = quiz.attempts.length > 0
      ? quiz.attempts.reduce((sum, a) => sum + a.score, 0) / quiz.attempts.length
      : 0;

    res.json({
      quiz: { id: quiz.id, title: quiz.title, competency: quiz.competency },
      totalAttempts: quiz.attempts.length,
      averageScore: Math.round(avgScore),
      attempts: quiz.attempts.map(a => ({
        id: a.id, learnerName: a.profile.fullName,
        score: a.score, correctAnswers: a.correctAnswers,
        totalQuestions: a.totalQuestions, attemptedAt: a.attemptedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load analytics' });
  }
}

// ─── NSSTA Integration ─────────────────────────────────────────────────────

export async function ingestNSSTA(req: AuthRequest, res: Response): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No PDF file uploaded' });
      return;
    }

    if (file.mimetype !== 'application/pdf') {
      res.status(400).json({ error: 'NSSTA ingestion currently only supports PDF files' });
      return;
    }

    const created = await ingestNSSTAProgrammes(file.buffer, file.originalname);
    res.json({ success: true, count: created.length, programmes: created });
  } catch (error: any) {
    console.error('NSSTA ingestion error:', error);
    res.status(500).json({ error: error.message || 'Failed to ingest NSSTA calendar' });
  }
}

export async function getNSSTAProgrammes(req: AuthRequest, res: Response): Promise<void> {
  try {
    const programmes = await prisma.nSSTATrainingProgramme.findMany({
      orderBy: { ingestedAt: 'desc' }
    });
    res.json(programmes);
  } catch (error) {
    console.error('Failed to get NSSTA programmes:', error);
    res.status(500).json({ error: 'Failed to fetch NSSTA programmes' });
  }
}

export async function updateNSSTAProgramme(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { competencyTags } = req.body;

    const programme = await prisma.nSSTATrainingProgramme.update({
      where: { id },
      data: { competencyTags }
    });
    res.json({ success: true, programme });
  } catch (error) {
    console.error('Failed to update NSSTA programme:', error);
    res.status(500).json({ error: 'Failed to update NSSTA programme' });
  }
}
