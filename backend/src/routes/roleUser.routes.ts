import express from 'express';
import {
  getAllRoleUsers,
  getRoleUserById,
  createRoleUser,
  updateRoleUser,
  deleteRoleUser,
  searchRoleUsers
} from '../controllers/roleUser.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// RESTful routes for RoleUser management
router.get('/', getAllRoleUsers);              // GET /api/roleUser - Get all roleUser assignments with pagination
router.get('/search', searchRoleUsers);         // GET /api/roleUser/search - Search roleUser assignments
router.get('/:id', getRoleUserById);           // GET /api/roleUser/:id - Get roleUser assignment by ID
router.post('/', createRoleUser);              // POST /api/roleUser - Create new roleUser assignment
router.put('/:id', updateRoleUser);            // PUT /api/roleUser/:id - Update roleUser assignment
router.delete('/:id', deleteRoleUser);         // DELETE /api/roleUser/:id - Delete roleUser assignment

export { router as roleUserRoutes };
