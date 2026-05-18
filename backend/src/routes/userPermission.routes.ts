import express from 'express';
import {
  getAllUserPermissions,
  assignPermissions,
  getAllUsersWithPermissions,
  removeUserPermission
} from '../controllers/userPermission.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// User permission management routes
router.get('/user/:userId', getAllUserPermissions);           // GET /api/userPermission/user/:userId - Get user's permissions grouped
router.post('/assign', assignPermissions);                    // POST /api/userPermission/assign - Assign permissions to user
router.get('/users', getAllUsersWithPermissions);           // GET /api/userPermission/users - Get all users with permissions
router.post('/remove', removeUserPermission);               // POST /api/userPermission/remove - Remove specific permission from user

export { router as userPermissionRoutes };
