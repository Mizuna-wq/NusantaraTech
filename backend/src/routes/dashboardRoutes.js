import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Isi dashboard menyesuaikan role: kandidat atau HR
router.get('/', authenticate, getDashboard);

export default router;
