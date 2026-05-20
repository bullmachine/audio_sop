import express from 'express';
import {
  createTracking,
  updateTracking,
  getActiveTracking,
  getTracking,
  getTrackingStats,
} from '../controllers/tracking.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Unified tracking routes
router.post('/', createTracking);                              // POST /api/tracking - Create tracking record (login or audio)
router.put('/:tracking_id', updateTracking);                   // PUT /api/tracking/:tracking_id - Update tracking record
router.get('/active/:operator_id', getActiveTracking);         // GET /api/tracking/active/:operator_id - Get active tracking for operator
router.get('/', getTracking);                                  // GET /api/tracking - Get tracking records with filters
router.get('/stats', getTrackingStats);                        // GET /api/tracking/stats - Get tracking statistics

export { router as trackingRoutes };
