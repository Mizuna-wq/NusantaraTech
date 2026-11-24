import { Router } from 'express';
import { getDashboard, getCompanyMe } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Isi dashboard menyesuaikan role: kandidat atau HR
router.get('/', authenticate, getDashboard);

// Info perusahaan pengguna (dipakai HR untuk menampilkan konteks perusahaan)
router.get('/me', authenticate, getCompanyMe);

export default router;
