import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getDashboardSummary,
  getDashboardData,
  getDashboardTrends,
  getDashboardAnalytics, 
  getUniquePlants
} from '../controllers/dashboard.controller';

const router = Router();

// All dashboard routes require authentication
// router.use(authenticate);

// Single dashboard endpoint that returns all data
router.get('/', getDashboardData);

// Dashboard summary metrics
router.get('/summary', getDashboardSummary);

// Dashboard trends over time
router.get('/trends', getDashboardTrends);

// Dashboard analytics with grouping
router.get('/analytics', getDashboardAnalytics);
 
// Get unique plants
router.get('/plants', getUniquePlants);

export default router;
