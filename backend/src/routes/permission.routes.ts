import express from 'express';
import {
  createPermissions,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
  searchPermissions,
  updateModulePermissions
} from '../controllers/permission.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Permission management routes
router.post('/create', createPermissions);           // POST /api/permission/create - Create permissions for module
router.post('/update-module', updateModulePermissions); // POST /api/permission/update-module - Update permissions for module
router.get('/', getAllPermissions);                // GET /api/permission - Get all permissions with pagination
router.get('/search', searchPermissions);          // GET /api/permission/search - Search permissions
router.get('/:id', getPermissionById);             // GET /api/permission/:id - Get permission by ID
router.put('/:id', updatePermission);              // PUT /api/permission/:id - Update permission
router.delete('/:id', deletePermission);           // DELETE /api/permission/:id - Delete permission

export { router as permissionRoutes };
