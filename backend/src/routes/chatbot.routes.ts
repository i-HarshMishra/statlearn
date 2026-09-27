import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { handleChatMessage } from '../controllers/chatbot.controller';

const router = Router();
router.use(authMiddleware);

router.post('/message', handleChatMessage);

export default router;
