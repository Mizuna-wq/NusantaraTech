import { Router } from 'express';
import { param } from 'express-validator';
import { getMyCv, uploadCv, deleteCv, downloadCv } from '../controllers/cvController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadCv as handleUpload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const idRule = param('id').isInt({ min: 1 }).withMessage('ID CV tidak valid');

router.get('/', authenticate, authorize('candidate'), getMyCv);
router.post('/', authenticate, authorize('candidate'), handleUpload, uploadCv);
router.delete('/:id', authenticate, authorize('candidate'), [idRule, validate], deleteCv);

// Kandidat (CV sendiri) dan HR (CV pelamar) boleh mengunduh
router.get('/:id/download', authenticate, [idRule, validate], downloadCv);

export default router;
