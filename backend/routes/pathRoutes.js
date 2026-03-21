import { Router } from 'express';
import {
  generatePath,
  getUserPaths,
  getPathById,
  toggleStepComplete,
  deletePath,
} from '../controllers/pathController.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';
import { generatePathSchema } from '../validators/pathSchemas.js';

const router = Router();

// All routes are protected
router.use(auth);

router.post('/generate', validate(generatePathSchema), generatePath);
router.get('/', getUserPaths);
router.get('/:id', getPathById);
router.patch('/:id/steps/:stepIndex', toggleStepComplete);
router.delete('/:id', deletePath);

export default router;
