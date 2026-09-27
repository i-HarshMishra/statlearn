import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { askChatbotLLM } from '../utils/gemini';

const prisma = new PrismaClient();

interface Intent {
  patterns: string[];
  handler: (userId: string, message: string) => Promise<string>;
}

/**
 * Rule-based chatbot intent engine.
 * Handles ~80% of queries without LLM. Falls back to generic response.
 */
const intents: Intent[] = [
  {
    patterns: ['readiness', 'my score', 'my readiness', 'how ready', 'overall score'],
    handler: async (userId: string) => {
      const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
      if (!profile) return "You haven't completed onboarding yet. Please visit the **Onboarding** page first.";
      const readiness = Math.round(profile.overallReadiness || 0);
      const level = readiness >= 80 ? 'High' : readiness >= 60 ? 'Moderate' : 'Low';
      return `📊 Your overall readiness score is **${readiness}%** (${level} Readiness).\n\n${
        readiness < 60 ? "I recommend checking your **Recommendations** page for courses to improve your skills." : "Great job! Keep up your learning momentum."
      }`;
    },
  },
  {
    patterns: ['skill gap', 'gaps', 'my gaps', 'weak areas', 'critical gap', 'improvement'],
    handler: async (userId: string) => {
      const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
      if (!profile) return "Complete your onboarding and diagnostic assessment to see skill gaps.";
      const gaps = await prisma.skillGap.findMany({
        where: { profileId: profile.id, gap: { gt: 0 } },
        include: { competency: true },
        orderBy: { gap: 'desc' },
      });
      if (gaps.length === 0) return "🎉 No skill gaps found! Your competencies meet or exceed your role requirements.";
      const critical = gaps.filter(g => g.severity === 'Critical');
      const moderate = gaps.filter(g => g.severity === 'Moderate');
      let msg = `You have **${gaps.length}** skill gaps:\n\n`;
      if (critical.length > 0) {
        msg += `🔴 **Critical (${critical.length}):** ${critical.map(g => g.competency.name).join(', ')}\n\n`;
      }
      if (moderate.length > 0) {
        msg += `🟡 **Moderate (${moderate.length}):** ${moderate.map(g => g.competency.name).join(', ')}\n\n`;
      }
      msg += "Visit the **Recommendations** page to see courses that address these gaps.";
      return msg;
    },
  },
  {
    patterns: ['recommend', 'course', 'suggest', 'what should i learn', 'learn next', 'igot', 'nssta'],
    handler: async (userId: string) => {
      const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
      if (!profile) return "Complete your onboarding to get personalized course recommendations.";
      const gaps = await prisma.skillGap.findMany({
        where: { profileId: profile.id, severity: 'Critical' },
        include: { competency: true },
        take: 3,
      });
      if (gaps.length === 0) return "No critical gaps found! Check the **Recommendations** page for optional courses.";
      const courses = await prisma.course.findMany({ take: 30 });
      const recommended = [];
      for (const gap of gaps) {
        const match = courses.find(c =>
          c.competencyTags.toLowerCase().includes(gap.competency.name.toLowerCase())
        );
        if (match) {
          recommended.push(`📚 **${match.title}** (${match.provider}) — addresses *${gap.competency.name}*`);
        }
      }
      if (recommended.length === 0) return "I found gaps but no matching courses yet. Ask your admin to add relevant courses.";
      return `Based on your critical gaps, I recommend:\n\n${recommended.join('\n\n')}\n\nVisit **Recommendations** for the full list.`;
    },
  },
  {
    patterns: ['competenc', 'my skills', 'what are my competencies', 'profile', 'my profile'],
    handler: async (userId: string) => {
      const profile = await prisma.employeeProfile.findUnique({
        where: { userId },
        include: { competencyScores: { include: { competency: true }, take: 5, orderBy: { score: 'desc' } } },
      });
      if (!profile) return "Complete onboarding to see your competency profile.";
      if (profile.competencyScores.length === 0) return "Take the **Diagnostic Assessment** first to generate your competency scores.";
      const top = profile.competencyScores.map(cs =>
        `• **${cs.competency.name}**: ${Math.round(cs.score)}/100 (Level ${cs.currentLevel})`
      ).join('\n');
      return `🎯 **Your Top Competencies:**\n\n${top}\n\nVisit the **Competencies** page for the full breakdown.`;
    },
  },
  {
    patterns: ['quiz', 'assessment', 'test', 'practice'],
    handler: async () => {
      const quizzes = await prisma.quiz.findMany({ where: { published: true }, take: 3 });
      if (quizzes.length === 0) return "No quizzes available yet. Check back soon!";
      const list = quizzes.map(q => `• **${q.title}** (${q.competency || 'General'} — ${q.difficulty})`).join('\n');
      return `📝 **Available Quizzes:**\n\n${list}\n\nVisit the **Quizzes** page to start one!`;
    },
  },
  {
    patterns: ['hello', 'hi', 'hey', 'help', 'what can you do'],
    handler: async () => {
      return `👋 Hi! I'm the **StatLearnAI Assistant**. I can help you with:\n\n• 📊 Check your **readiness score**\n• 🎯 View your **skill gaps**\n• 📚 Get **course recommendations**\n• 🧠 See your **competency profile**\n• 📝 Find **quizzes** to practice\n\nJust ask me anything!`;
    },
  },
  {
    patterns: ['thank', 'thanks', 'bye', 'goodbye'],
    handler: async () => "You're welcome! Keep learning and growing! 🚀",
  },
];

/**
 * POST /api/chatbot/message
 */
export async function handleChatMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const lowerMsg = message.toLowerCase();

    // Try to match intent
    for (const intent of intents) {
      const matched = intent.patterns.some(p => lowerMsg.includes(p));
      if (matched) {
        const reply = await intent.handler(userId, message);
        res.json({ reply, source: 'rule-based' });
        return;
      }
    }

    // Fallback response: Use LLM
    try {
      const profile = await prisma.employeeProfile.findUnique({ 
        where: { userId },
        include: { skillGaps: { include: { competency: true }, orderBy: { gap: 'desc' }, take: 3 } }
      });
      
      let contextStr = 'Anonymous user (no profile)';
      if (profile) {
        const gapStr = profile.skillGaps.map(g => `${g.competency.name} (${g.severity} gap)`).join(', ');
        contextStr = `Name: ${profile.fullName}, Designation: ${profile.designation}, Department: ${profile.department}. Readiness Score: ${profile.overallReadiness}%. Top skill gaps: ${gapStr || 'None'}.`;
      }
      
      const llmReply = await askChatbotLLM(message, contextStr);
      res.json({ reply: llmReply, source: 'llm' });
      return;
    } catch (llmErr) {
      console.error('LLM fallback failed:', llmErr);
      res.json({
        reply: `I'm not sure about that. Here are some things I can help with:\n\n• "What's my readiness score?"\n• "Show my skill gaps"\n• "Recommend courses"\n• "Show my competencies"\n• "Available quizzes"\n\nTry one of these! 😊`,
        source: 'rule-based',
      });
    }
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
}
