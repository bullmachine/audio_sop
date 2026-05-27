import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { GenericCrudController } from "./genericCrud.controller";
import { UPLOADS_ROOT } from "../config/paths.config";
import AudioSop, { IAudioFile } from "../models/AudioSop";
import { AuthRequest } from "../types/express";
import User from "../models/User";
import Language from "../models/Language";

const populateFields = ["product", "stage", "language", "sop", "operators", "createdBy"];
const audioSopController = new GenericCrudController(AudioSop, populateFields);

const sortFilesByOrder = (files: IAudioFile[]) => [...files].sort((a, b) => a.order - b.order);

const resolveAudioDiskPath = (file: IAudioFile): string | null => {
  const candidates = [
    path.join(UPLOADS_ROOT, "audio", file.fileName),
    path.join(UPLOADS_ROOT, file.filePath.replace(/^\//, "").replace(/^uploads\//, "")),
    path.join(UPLOADS_ROOT, "audio", file.originalName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
};

const withPlayablePaths = (files: IAudioFile[]) =>
  sortFilesByOrder(files).map((file) => {
    const diskPath = resolveAudioDiskPath(file);
    if (!diskPath) return file;

    const relative = path.relative(UPLOADS_ROOT, diskPath).split(path.sep).join("/");
    return {
      ...file,
      filePath: `/uploads/${relative}`,
    };
  });

const formatAudioSop = (item: any) => {
  const doc = item?.toObject ? item.toObject() : { ...item };
  if (doc.files) doc.files = withPlayablePaths(doc.files);
  return doc;
};

const withFormattedResponse = (
  handler: (req: Request, res: Response) => any
) => {
  return async (req: Request, res: Response) => {
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (body?.data) {
        body.data = Array.isArray(body.data)
          ? body.data.map(formatAudioSop)
          : formatAudioSop(body.data);
      }
      return originalJson(body);
    };
    await handler(req, res);
  };
};

const deleteFileFromDisk = (filePath: string) => {
  const relative = filePath.replace(/^\//, "").replace(/^uploads\//, "");
  const fullPath = path.join(UPLOADS_ROOT, relative);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

export const getAllAudioSops = withFormattedResponse(audioSopController.getAll);
export const getAudioSopById = withFormattedResponse(audioSopController.getById);
export const searchAudioSops = withFormattedResponse(audioSopController.search);
export const getActiveAudioSops = withFormattedResponse(audioSopController.getActive);
export const restoreAudioSop = audioSopController.restore;
export const toggleActiveAudioSop = audioSopController.toggleActive;

export const createAudioSop = async (req: AuthRequest, res: Response) => {
  try {
    const { product, stage, language, sop, operators, fileOrder } = req.body;
    const uploadedFiles = req.files as Express.Multer.File[];

    if (!product || !stage || !language || !sop?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product, stage, language, and SOP are required",
      });
    }

    let operatorIds: string[] = [];
    try {
      operatorIds = typeof operators === "string" ? JSON.parse(operators) : operators;
    } catch {
      return res.status(400).json({ success: false, message: "Invalid operators selection" });
    }

    if (!Array.isArray(operatorIds) || operatorIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one operator must be selected",
      });
    }

    if (!uploadedFiles?.length) {
      return res.status(400).json({
        success: false,
        message: "At least one audio file is required",
      });
    }

    let orderMap: Record<string, number> = {};
    if (fileOrder) {
      try {
        orderMap = typeof fileOrder === "string" ? JSON.parse(fileOrder) : fileOrder;
      } catch {
        orderMap = {};
      }
    }

    const files: IAudioFile[] = uploadedFiles.map((file, index) => ({
      fileName: file.filename,
      originalName: file.originalname,
      filePath: `/uploads/audio/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      order: orderMap[file.originalname] ?? index,
    }));

    const audioSopDoc: any = await AudioSop.create({
      product,
      stage,
      language,
      sop: sop.trim(),
      operators: operatorIds,
      files: sortFilesByOrder(files),
      createdBy: req.user?.id,
    } as any);

    const result = await AudioSop.findById(audioSopDoc._id).populate(populateFields);
    res.status(201).json({
      success: true,
      message: "Record created successfully",
      data: formatAudioSop(result),
    });
  } catch (error: any) {
    if (req.files) {
      (req.files as Express.Multer.File[]).forEach((file) => {
        deleteFileFromDisk(`/uploads/audio/${file.filename}`);
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAudioSop = async (req: AuthRequest, res: Response) => {
  try {
    const audioSopDoc = await AudioSop.findOne({ _id: req.params.id, isDeleted: false });
    if (!audioSopDoc) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    const { product, stage, language, sop, operators, fileOrder, removedFileIds } = req.body;
    const uploadedFiles = req.files as Express.Multer.File[];

    if (product) audioSopDoc.product = product;
    if (stage) audioSopDoc.stage = stage;
    if (language) audioSopDoc.language = language;
    if (sop) audioSopDoc.sop = sop;

    if (operators) {
      try {
        const operatorIds = typeof operators === "string" ? JSON.parse(operators) : operators;
        if (Array.isArray(operatorIds) && operatorIds.length > 0) {
          audioSopDoc.operators = operatorIds;
        }
      } catch {
        return res.status(400).json({ success: false, message: "Invalid operators" });
      }
    }

    let removedIds: string[] = [];
    if (removedFileIds) {
      try {
        removedIds =
          typeof removedFileIds === "string" ? JSON.parse(removedFileIds) : removedFileIds;
      } catch {
        removedIds = [];
      }
    }

    if (removedIds.length) {
      audioSopDoc.files.forEach((file: any) => {
        if (removedIds.includes(file._id.toString())) {
          deleteFileFromDisk(file.filePath);
        }
      });
      audioSopDoc.files = audioSopDoc.files.filter(
        (file: any) => !removedIds.includes(file._id.toString())
      ) as IAudioFile[];
    }

    if (uploadedFiles?.length) {
      const startOrder = audioSopDoc.files.length;
      const newFiles: IAudioFile[] = uploadedFiles.map((file, index) => ({
        fileName: file.filename,
        originalName: file.originalname,
        filePath: `/uploads/audio/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
        order: startOrder + index,
      }));
      audioSopDoc.files = [...audioSopDoc.files, ...newFiles] as IAudioFile[];
    }

    if (fileOrder) {
      try {
        const orderMap = typeof fileOrder === "string" ? JSON.parse(fileOrder) : fileOrder;
        audioSopDoc.files = audioSopDoc.files.map((file: any) => {
          const key = file._id?.toString();
          if (key && orderMap[key] !== undefined) file.order = orderMap[key];
          return file;
        }) as IAudioFile[];
        audioSopDoc.files = sortFilesByOrder(audioSopDoc.files);
      } catch {
        /* keep existing order */
      }
    }

    await audioSopDoc.save();
    const result = await AudioSop.findById(audioSopDoc._id).populate(populateFields);
    res.json({
      success: true,
      message: "Record updated successfully",
      data: formatAudioSop(result),
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAudioSop = async (req: AuthRequest, res: Response) => {
  try {
    const sop = await AudioSop.findOne({ _id: req.params.id, isDeleted: false });
    if (!sop) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    sop.files.forEach((file) => deleteFileFromDisk(file.filePath));
    sop.isDeleted = true;
    sop.deletedAt = new Date();
    sop.isActive = false;
    await sop.save();

    res.json({ success: true, message: "Record deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAssignments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const user = await User.findById(req.user.id).populate("role");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const sopFilter = req.query.sop as string;
    const languageFilter = req.query.language as string;

    const query: Record<string, unknown> = {
      isDeleted: false,
      isActive: true,
      operators: req.user.id,
    };

    if (sopFilter) query.sop = sopFilter;
    if (languageFilter) query.language = languageFilter;
     
    const assignments = await AudioSop.find(query).populate(populateFields).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: assignments.map(formatAudioSop),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { audioSopController as audioSop };
