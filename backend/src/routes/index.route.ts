import express from "express";
import { router as commonRouter } from "./common.route";
import { roleRoutes } from "./role.routes";
import { userRoutes } from "./user.routes";
import { roleUserRoutes } from "./roleUser.routes";
import { permissionRoutes } from "./permission.routes";
import { userPermissionRoutes } from "./userPermission.routes";
import { languageRoutes } from "./language.routes"; 
import stageRoutes from "./stage.routes"; 

const router = express.Router();

// Authentication routes (legacy)
router.use('/auth', commonRouter);

// Project Route
router.use('/stage', stageRoutes);
router.use('/language', languageRoutes);

// New RESTful routes for GenericCrudService
router.use('/role', roleRoutes);
router.use('/users', userRoutes);
router.use('/roleUser', roleUserRoutes);
router.use('/permission', permissionRoutes);
router.use('/userPermission', userPermissionRoutes); 

export { router };