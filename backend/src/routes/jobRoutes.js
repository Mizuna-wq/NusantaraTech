import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  listJobs,
  getFilters,
  getJob,
  listAllJobs,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
} from '../controllers/jobController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { EMPLOYMENT_TYPES, JOB_STATUSES } from '../utils/constants.js';

const router = Router();

const idRule = param('id').isInt({ min: 1 }).withMessage('ID lowongan tidak valid');

const jobRules = [
  body('title').trim().isLength({ min: 3, max: 150 }).withMessage('Judul posisi wajib diisi (3-150 karakter)'),
  body('department').trim().isLength({ min: 2, max: 100 }).withMessage('Department wajib diisi'),
  body('description').trim().notEmpty().withMessage('Deskripsi pekerjaan wajib diisi'),
  body('responsibilities').trim().notEmpty().withMessage('Tanggung jawab wajib diisi'),
  body('qualifications').trim().notEmpty().withMessage('Kualifikasi wajib diisi'),
  body('benefits').trim(),
  body('location').trim().isLength({ min: 2, max: 100 }).withMessage('Lokasi wajib diisi'),
  body('employment_type').isIn(EMPLOYMENT_TYPES).withMessage('Jenis pekerjaan tidak valid'),
  body('salary_min').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Gaji minimum harus berupa angka').toInt(),
  body('salary_max')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 }).withMessage('Gaji maksimum harus berupa angka').toInt()
    .custom((value, { req }) => !req.body.salary_min || value >= req.body.salary_min)
    .withMessage('Gaji maksimum tidak boleh lebih kecil dari gaji minimum'),
  body('deadline').optional({ values: 'falsy' }).isISO8601().withMessage('Format deadline tidak valid'),
  body('status').isIn(JOB_STATUSES).withMessage('Status lowongan tidak valid'),
  validate,
];

// Publik
router.get('/', listJobs);
router.get('/filters', getFilters);

// HR (harus sebelum '/:id' agar "admin" tidak dianggap sebagai id)
router.get('/admin/all', authenticate, authorize('admin'), listAllJobs);

router.get('/:id', [idRule, validate], optionalAuth, getJob);

router.post('/', authenticate, authorize('admin'), jobRules, createJob);
router.put('/:id', authenticate, authorize('admin'), [idRule, ...jobRules], updateJob);
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  [idRule, body('status').isIn(JOB_STATUSES).withMessage('Status lowongan tidak valid'), validate],
  updateJobStatus
);
router.delete('/:id', authenticate, authorize('admin'), [idRule, validate], deleteJob);

export default router;
