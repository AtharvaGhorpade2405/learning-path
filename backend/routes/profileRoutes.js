const { Router } = require('express');
const { analyzeProfile, getProfile, recalculateNsqf } = require('../controllers/profileController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { analyzeProfileSchema } = require('../validators/profileSchemas');

const router = Router();

// All routes are protected
router.use(auth);

router.get('/', getProfile);
router.post('/analyze', validate(analyzeProfileSchema), analyzeProfile);
router.post('/recalculate', recalculateNsqf);

module.exports = router;
