import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getCurrentUser
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// RESTful routes for User management
router.get('/', getAllUsers);              // GET /api/users - Get all users with pagination
router.get('/search', searchUsers);         // GET /api/users/search - Search users
router.get('/me', getCurrentUser);          // GET /api/users/me - Get current authenticated user
router.get('/:id', getUserById);           // GET /api/users/:id - Get user by ID
router.post('/', createUser);              // POST /api/users - Create new user
router.put('/:id', updateUser);            // PUT /api/users/:id - Update user
router.delete('/:id', deleteUser);         // DELETE /api/users/:id - Delete user

export { router as userRoutes };
