const { Router } = require('express');
const { signup, login, getMe } = require('../controllers/authController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { signupSchema, loginSchema } = require('../validators/authSchemas');

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', auth, getMe);

module.exports = router;
