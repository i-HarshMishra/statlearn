import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import learnerRoutes from './routes/learner.routes';
import diagnosticRoutes from './routes/diagnostic.routes';
import adminRoutes from './routes/admin.routes';
import chatbotRoutes from './routes/chatbot.routes';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/learner', learnerRoutes);
app.use('/api/diagnostic', diagnosticRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
