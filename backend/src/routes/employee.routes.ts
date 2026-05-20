import express from 'express';
import {
  fetchAndStoreEmployees,
  getEmployees,
  getEmployeeByCode,
  getEmployeeStats,
} from '../controllers/employee.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Employee management routes
router.post('/fetch', fetchAndStoreEmployees);           // POST /api/employees/fetch - Fetch and store employees from Darwinbox
router.get('/', getEmployees);                           // GET /api/employees - Get all employees with pagination
router.get('/stats', getEmployeeStats);                  // GET /api/employees/stats - Get employee statistics
router.get('/:empCode', getEmployeeByCode);              // GET /api/employees/:empCode - Get employee by code

export { router as employeeRoutes };
