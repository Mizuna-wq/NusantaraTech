import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createApplication,
  listApplications,
  getApplication,
  updateStatus,
  updateInternalNote,
} from '../controllers/applicationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { APPLICATION_STATUSES } from '../utils/constants.js';
import { PHONE_REGEX, PHONE_MESSAGE, cleanPhone } from '../utils/validators.js';

const router = Router();

const idRule = param('id').isInt({ min: 1 }).withMessage('ID lamaran tidak valid');

router.use(authenticate);

router.get('/', listApplications);

router.post(
  '/',
  authorize('candidate'),
  [
    body('job_id').isInt({ min: 1 }).withMessage('Lowongan tidak valid').toInt(),
    body('phone').customSanitizer(cleanPhone).matches(PHONE_REGEX).withMessage(PHONE_MESSAGE),
    body('cover_letter').trim().isLength({ max: 3000 }).withMessage('Cover letter maksimal 3000 karakter'),
    validate,
  ],
  createApplication
);

router.get('/:id', [idRule, validate], getApplication);

router.put(
  '/:id/status',
  authorize('admin'),
  [
    idRule,
    body('status').isIn(APPLICATION_STATUSES).withMessage('Status tidak valid'),
    body('note').trim().isLength({ max: 1000 }).withMessage('Catatan maksimal 1000 karakter'),
    validate,
  ],
  updateStatus
);

router.put(
  '/:id/notes',
  authorize('admin'),
  [
    idRule,
    body('note_internal').trim().isLength({ max: 2000 }).withMessage('Catatan maksimal 2000 karakter'),
    validate,
  ],
  updateInternalNote
);

export default router;
