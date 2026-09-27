import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getDiagnosticQuestions, submitDiagnostic } from '../controllers/diagnostic.controller';

const router = Router();
router.use(authMiddleware);

router.get('/questions', getDiagnosticQuestions);
router.post('/submit', submitDiagnostic);

export default router;
