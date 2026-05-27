import express from 'express';
import { SOPController } from '../controllers/sop.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// SOP routes
router.get('/', SOPController.getAll);                    // GET /api/sop - Get all SOPs
router.get('/active', SOPController.getActive);           // GET /api/sop/active - Get active SOPs
router.get('/:id', SOPController.getById);                // GET /api/sop/:id - Get SOP by ID
router.post('/', SOPController.create);                   // POST /api/sop - Create new SOP
router.put('/:id', SOPController.update);                 // PUT /api/sop/:id - Update SOP
router.delete('/:id', SOPController.delete);              // DELETE /api/sop/:id - Delete SOP
router.post('/upload', SOPController.uploadExcel);        // POST /api/sop/upload - Upload Excel file
router.get('/download/template', SOPController.downloadTemplate); // GET /api/sop/download/template - Download template
router.get('/export/all', SOPController.exportSOPs);      // GET /api/sop/export/all - Export all SOPs

export { router as sopRoutes };
