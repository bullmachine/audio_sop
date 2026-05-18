import express from 'express';
import {
  getAllLanguage,
  getLevelById,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  getActiveLanguage,
  restoreLanguage,
  toggleActiveStatus,
  searchLanguage
} from '../controllers/language.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Level management routes
router.post('/', createLanguage);                    // POST /api/level - Create new level
router.get('/', getAllLanguage);                   // GET /api/level - Get all levels with pagination
router.get('/active', getActiveLanguage);          // GET /api/level/active - Get active levels only
router.get('/search', searchLanguage);             // GET /api/level/search - Search levels
router.get('/:id', getLevelById);                // GET /api/level/:id - Get level by ID
router.put('/:id', updateLanguage);                 // PUT /api/level/:id - Update level
router.delete('/:id', deleteLanguage);             // DELETE /api/level/:id - Soft delete level
router.post('/:id/restore', restoreLanguage);        // POST /api/level/:id/restore - Restore soft deleted level
router.patch('/:id/toggle', toggleActiveStatus); // PATCH /api/level/:id/toggle - Toggle active status

export { router as languageRoutes };
