import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getActiveProducts,
  restoreProduct,
  toggleActiveProduct,
  searchProducts,
} from "../controllers/product.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

router.use(authenticate);

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/active", getActiveProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/restore", restoreProduct);
router.patch("/:id/toggle", toggleActiveProduct);

export { router as productRoutes };
