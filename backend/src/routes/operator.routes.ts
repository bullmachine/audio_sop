import express from "express";
import {
  getAllOperators,
  getOperatorById,
  createOperator,
  updateOperator,
  deleteOperator,
  getActiveOperators,
  searchOperators,
} from "../controllers/operator.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

router.use(authenticate);

router.get("/", getAllOperators);
router.get("/active", getActiveOperators);
router.get("/search", searchOperators);
router.get("/:id", getOperatorById);
router.post("/", createOperator);
router.put("/:id", updateOperator);
router.delete("/:id", deleteOperator);

export { router as operatorRoutes };
