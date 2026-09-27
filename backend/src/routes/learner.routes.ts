import { Router } from 'express';
import { authMiddleware, roleGuard } from '../middleware/auth.middleware';
import {
  submitOnboarding, getDashboard, getProfile, getCompetencies,
  getRecommendationsHandler, completeCourse, enrollCourse,
  getQuizzes, getQuizById, submitQuizAttempt, verifyCertificate
} from '../controllers/learner.controller';

import { generateLearnerQuiz } from '../controllers/learner-quiz.controller';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();
router.use(authMiddleware);
router.use(roleGuard('LEARNER'));

router.post('/onboarding', submitOnboarding);
router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.get('/competencies', getCompetencies);
router.get('/recommendations', getRecommendationsHandler);
router.post('/course/:courseId/enroll', enrollCourse);
router.post('/course/:courseId/complete', completeCourse);
router.post('/course/:courseId/verify-certificate', upload.single('certificate'), verifyCertificate);
router.get('/quizzes', getQuizzes);
router.get('/quizzes/:quizId', getQuizById);
router.post('/quizzes/:quizId/attempt', submitQuizAttempt);
router.post('/generate-quiz', upload.single('material'), generateLearnerQuiz);

export default router;
