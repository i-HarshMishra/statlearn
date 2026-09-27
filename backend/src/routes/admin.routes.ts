import { Router } from 'express';
import { authMiddleware, roleGuard } from '../middleware/auth.middleware';
import {
  getAdminDashboard, getEmployees, getDesignationReadiness, talentSearch,
  getCompetencies, createCompetency, updateCompetency, deleteCompetency,
  getBenchmarks, createBenchmark, deleteBenchmark,
  getCourses, createCourse, deleteCourse,
  getUsers, updateUserRole,
  uploadMaterial, generateQuiz, getMaterials, getQuizzes, publishQuiz, getQuizAnalytics, extractTextFromDocument,
  ingestNSSTA, getNSSTAProgrammes, updateNSSTAProgramme
} from '../controllers/admin.controller';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
router.use(authMiddleware);
router.use(roleGuard('ADMIN'));

// Workforce Intelligence
router.get('/dashboard', getAdminDashboard);
router.get('/employees', getEmployees);
router.get('/designation-readiness', getDesignationReadiness);
router.get('/talent-search', talentSearch);

// System Configuration: Competencies
router.get('/competencies', getCompetencies);
router.post('/competencies', createCompetency);
router.put('/competencies/:id', updateCompetency);
router.delete('/competencies/:id', deleteCompetency);

// System Configuration: Benchmarks
router.get('/benchmarks', getBenchmarks);
router.post('/benchmarks', createBenchmark);
router.delete('/benchmarks/:id', deleteBenchmark);

// System Configuration: Courses
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.delete('/courses/:id', deleteCourse);

// System Configuration: Users
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);

// Content & Quiz Management
router.post('/extract-text', upload.single('file'), extractTextFromDocument);
router.post('/upload', uploadMaterial);
router.post('/generate-quiz', generateQuiz);
router.get('/materials', getMaterials);
router.get('/quizzes', getQuizzes);
router.put('/quizzes/:quizId/publish', publishQuiz);
router.get('/quizzes/:quizId/analytics', getQuizAnalytics);

// NSSTA Integration
router.post('/nssta/ingest', upload.single('file'), ingestNSSTA);
router.get('/nssta/programmes', getNSSTAProgrammes);
router.put('/nssta/programmes/:id', updateNSSTAProgramme);

export default router;
