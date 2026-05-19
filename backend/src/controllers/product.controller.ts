import { GenericCrudController } from "./genericCrud.controller";
import Product from "../models/Product";

const productController = new GenericCrudController(Product, []);

export const getAllProducts = productController.getAll;
export const getProductById = productController.getById;
export const createProduct = productController.create;
export const updateProduct = productController.update;
export const deleteProduct = productController.delete;
export const searchProducts = productController.search;
export const getActiveProducts = productController.getActive;
export const restoreProduct = productController.restore;
export const toggleActiveProduct = productController.toggleActive;

export { productController as product };
