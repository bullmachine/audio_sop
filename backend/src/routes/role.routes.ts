import express from 'express';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  searchRoles
} from '../controllers/role.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// RESTful routes for Role management
router.get('/', getAllRoles);              // GET /api/role - Get all roles with pagination
router.get('/search', searchRoles);         // GET /api/role/search - Search roles
router.get('/:id', getRoleById);           // GET /api/role/:id - Get role by ID
router.post('/', createRole);              // POST /api/role - Create new role
router.put('/:id', updateRole);            // PUT /api/role/:id - Update role
router.delete('/:id', deleteRole);         // DELETE /api/role/:id - Delete role

export { router as roleRoutes };
