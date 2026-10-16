import { Router } from 'express';
import { body, param } from 'express-validator';
import { getCandidate, updateCandidate } from '../controllers/candidateController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { PHONE_REGEX, PHONE_MESSAGE, cleanPhone } from '../utils/validators.js';

const router = Router();

const idRule = param('id').isInt({ min: 1 }).withMessage('ID tidak valid');

router.get('/:id', authenticate, [idRule, validate], getCandidate);

router.put(
  '/:id',
  authenticate,
  authorize('candidate'),
  [
    idRule,
    body('full_name').trim().isLength({ min: 2, max: 100 }).withMessage('Nama lengkap wajib diisi (2-100 karakter)'),
    body('email').trim().toLowerCase().isEmail().withMessage('Format email tidak valid').isLength({ max: 150 }).withMessage('Email terlalu panjang'),
    body('phone').customSanitizer(cleanPhone).matches(PHONE_REGEX).withMessage(PHONE_MESSAGE),
    body('address').trim().isLength({ max: 255 }).withMessage('Alamat maksimal 255 karakter'),
    body('city').trim().isLength({ max: 100 }).withMessage('Kota maksimal 100 karakter'),
    body('education').trim().isLength({ max: 255 }).withMessage('Pendidikan maksimal 255 karakter'),
    body('skills').trim().isLength({ max: 1000 }).withMessage('Skills maksimal 1000 karakter'),
    validate,
  ],
  updateCandidate
);

export default router;
