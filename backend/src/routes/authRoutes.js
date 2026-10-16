import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me, changePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  PHONE_REGEX,
  PHONE_MESSAGE,
  PASSWORD_REGEX,
  PASSWORD_MESSAGE,
  cleanPhone,
} from '../utils/validators.js';

const router = Router();

router.post(
  '/register',
  [
    body('full_name').trim().isLength({ min: 2, max: 100 }).withMessage('Nama lengkap wajib diisi (2-100 karakter)'),
    body('email').trim().toLowerCase().isEmail().withMessage('Format email tidak valid').isLength({ max: 150 }).withMessage('Email terlalu panjang'),
    body('phone').customSanitizer(cleanPhone).matches(PHONE_REGEX).withMessage(PHONE_MESSAGE),
    body('password').matches(PASSWORD_REGEX).withMessage(PASSWORD_MESSAGE),
    body('confirm_password').custom((value, { req }) => value === req.body.password).withMessage('Konfirmasi password tidak sama'),
    validate,
  ],
  register
);

router.post(
  '/login',
  [
    body('email').trim().toLowerCase().isEmail().withMessage('Format email tidak valid'),
    body('password').notEmpty().withMessage('Password wajib diisi'),
    validate,
  ],
  login
);

router.get('/me', authenticate, me);

router.put(
  '/password',
  authenticate,
  [
    body('current_password').notEmpty().withMessage('Password saat ini wajib diisi'),
    body('new_password').matches(PASSWORD_REGEX).withMessage(PASSWORD_MESSAGE),
    body('confirm_password').custom((value, { req }) => value === req.body.new_password).withMessage('Konfirmasi password tidak sama'),
    validate,
  ],
  changePassword
);

export default router;
