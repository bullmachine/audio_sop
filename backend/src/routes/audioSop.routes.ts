import express from "express";
import {
  getAllAudioSops,
  getAudioSopById,
  createAudioSop,
  updateAudioSop,
  deleteAudioSop,
  getActiveAudioSops,
  restoreAudioSop,
  toggleActiveAudioSop,
  searchAudioSops,
  getMyAssignments,
} from "../controllers/audioSop.controller";
import { authenticate } from "../middleware/auth.middleware";
import { audioUpload } from "../utils/multer.util";

const router = express.Router();

router.use(authenticate);

router.get("/my-assignments", getMyAssignments);
router.post("/", audioUpload.array("audioFiles", 20), createAudioSop);
router.get("/", getAllAudioSops);
router.get("/active", getActiveAudioSops);
router.get("/search", searchAudioSops);
router.get("/:id", getAudioSopById);
router.put("/:id", audioUpload.array("audioFiles", 20), updateAudioSop);
router.delete("/:id", deleteAudioSop);
router.post("/:id/restore", restoreAudioSop);
router.patch("/:id/toggle", toggleActiveAudioSop);

export { router as audioSopRoutes };
