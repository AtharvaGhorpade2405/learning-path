const { Router } = require('express');
const {
  generatePath,
  getUserPaths,
  getPathById,
  toggleStepComplete,
  deletePath,
} = require('../controllers/pathController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { generatePathSchema } = require('../validators/pathSchemas');

const router = Router();

// All routes are protected
router.use(auth);

router.post('/generate', validate(generatePathSchema), generatePath);
router.get('/', getUserPaths);
router.get('/:id', getPathById);
router.patch('/:id/steps/:stepIndex', toggleStepComplete);
router.delete('/:id', deletePath);

module.exports = router;
