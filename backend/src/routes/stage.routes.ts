import { Router } from 'express';
import { StageController } from '../controllers/stage.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
// router.use(authenticate);

// CRUD Routes
router.get('/', StageController.getAll);
router.get('/:id', StageController.getById);
router.post('/', StageController.create);
router.put('/:id', StageController.update);
router.delete('/:id', StageController.delete);

// Excel Upload Routes
router.post('/upload', StageController.uploadExcel);
router.get('/template/download', StageController.downloadTemplate);
router.get('/export', StageController.exportProcesses);
 
export default router;
