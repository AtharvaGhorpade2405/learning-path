import { Router } from 'express';
import { signup, login, getMe } from '../controllers/authController.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';
import { signupSchema, loginSchema } from '../validators/authSchemas.js';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', auth, getMe);

export default router;
