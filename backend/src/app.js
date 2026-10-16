import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import cvRoutes from './routes/cvRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Folder uploads sengaja TIDAK dibuka sebagai file statis.
// CV hanya bisa diunduh lewat GET /api/cv/:id/download (butuh login dan izin).

app.get('/api/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({
    success: true,
    message: 'Backend dan database berjalan',
    data: { time: new Date().toISOString() },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
