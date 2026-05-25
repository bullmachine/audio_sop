import express from "express";
import { router as commonRouter } from "./common.route";
import { roleRoutes } from "./role.routes";
import { userRoutes } from "./user.routes";
import { roleUserRoutes } from "./roleUser.routes";
import { permissionRoutes } from "./permission.routes";
import { userPermissionRoutes } from "./userPermission.routes";
import { languageRoutes } from "./language.routes";
import stageRoutes from "./stage.routes";
import { productRoutes } from "./product.routes";
import { operatorRoutes } from "./operator.routes";
import { audioSopRoutes } from "./audioSop.routes";
import { employeeRoutes } from "./employee.routes";
import { trackingRoutes } from "./tracking.routes";
import { sopRoutes } from "./sop.routes";

const router = express.Router();

// Authentication routes (legacy)
router.use('/auth', commonRouter);

// Project Route
router.use('/stage', stageRoutes);
router.use('/language', languageRoutes);
router.use('/product', productRoutes);
router.use('/sop', sopRoutes);
router.use('/operator', operatorRoutes);
router.use('/audio-sop', audioSopRoutes);

// New RESTful routes for GenericCrudService
router.use('/role', roleRoutes);
router.use('/users', userRoutes);
router.use('/roleUser', roleUserRoutes);
router.use('/permission', permissionRoutes);
router.use('/userPermission', userPermissionRoutes);
router.use('/employees', employeeRoutes);
router.use('/tracking', trackingRoutes);

export { router };