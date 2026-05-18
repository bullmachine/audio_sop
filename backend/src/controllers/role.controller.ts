import { GenericCrudController } from './genericCrud.controller';
import Role from '../models/Role';

// Create a generic CRUD controller for Role model
const roleController = new GenericCrudController(Role, []);

// Export all CRUD operations
export const getAllRoles = roleController.getAll;
export const getRoleById = roleController.getById;
export const createRole = roleController.create;
export const updateRole = roleController.update;
export const deleteRole = roleController.delete;
export const searchRoles = roleController.search;

// Legacy exports for backward compatibility
export { roleController as role };

// Keep the old functions for backward compatibility but mark as deprecated
export const roleCreate = createRole;
export const roleList = getAllRoles;
