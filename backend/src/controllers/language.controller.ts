import { GenericCrudController } from './genericCrud.controller'; 
import Language from '../models/Language';

// Create a generic CRUD controller for Level model
const languageController = new GenericCrudController(Language, []);

// Export all CRUD operations
export const getAllLanguage = languageController.getAll;
export const getLevelById = languageController.getById;
export const createLanguage = languageController.create;
export const updateLanguage = languageController.update;
export const deleteLanguage = languageController.delete;
export const searchLanguage = languageController.search;
export const getActiveLanguage = languageController.getActive;
export const restoreLanguage = languageController.restore;
export const toggleActiveStatus = languageController.toggleActive;

// Legacy exports for backward compatibility
export { languageController as language };

// Keep the old functions for backward compatibility but mark as deprecated
export const levelCreate = createLanguage;
export const levelList = getAllLanguage;
