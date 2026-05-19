import { Request, Response } from "express";
import mongoose from "mongoose";
import { GenericCrudController } from "./genericCrud.controller";
import User from "../models/User";
import Role from "../models/Role";

const operatorCrudController = new GenericCrudController(User, ["role"]);

const getOperatorRole = async () => Role.findOne({ role: "Operator", status: true });

const buildOperatorQuery = (search?: string) => {
  const query: Record<string, unknown> = { isDeleted: false };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { empCode: { $regex: search, $options: "i" } },
    ];
  }
  return query;
};

export const getAllOperators = async (req: Request, res: Response) => {
  try {
    const operatorRole = await getOperatorRole();
    if (!operatorRole) {
      return res.json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const skip = (page - 1) * limit;
    const query = { ...buildOperatorQuery(search), role: operatorRole._id };

    const [data, total] = await Promise.all([
      User.find(query as any)
        .select("-password")
        .populate("role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query as any),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOperatorById = operatorCrudController.getById;
export const deleteOperator = operatorCrudController.delete;
export const searchOperators = operatorCrudController.search;

export const createOperator = async (req: Request, res: Response) => {
  try {
    const { name, loginId, password } = req.body;

    if (!name?.trim() || !loginId?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, Login ID, and Password are required",
      });
    }

    const operatorRole = await getOperatorRole();
    if (!operatorRole) {
      return res.status(400).json({ success: false, message: "Operator role not configured" });
    }

    const normalizedLoginId = loginId.trim().toUpperCase();
    const existing = await User.findOne({ empCode: normalizedLoginId, isDeleted: false });

    if (existing) {
      return res.status(400).json({ success: false, message: "Login ID already exists" });
    }

    const operator: any = await User.create({
      name: name.trim(),
      empCode: normalizedLoginId,
      email: `${normalizedLoginId.toLowerCase()}@operator.audio`,
      mobile: normalizedLoginId.replace(/\D/g, "").slice(0, 10) || "0000000000",
      password,
      role: operatorRole._id as mongoose.Types.ObjectId,
      plant: "Operator",
    } as any);

    const result = await User.findById(operator._id).select("-password").populate("role");
    res.status(201).json({ success: true, message: "Operator created successfully", data: result });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Login ID already exists" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOperator = async (req: Request, res: Response) => {
  try {
    const { name, loginId, password, isActive } = req.body;
    const operator = await User.findOne({ _id: req.params.id, isDeleted: false });

    if (!operator) {
      return res.status(404).json({ success: false, message: "Operator not found" });
    }

    if (name !== undefined) operator.name = name.trim();

    if (loginId !== undefined) {
      const normalizedLoginId = loginId.trim().toUpperCase();
      const duplicate = await User.findOne({
        empCode: normalizedLoginId,
        _id: { $ne: operator._id },
        isDeleted: false,
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: "Login ID already exists" });
      }
      operator.empCode = normalizedLoginId;
    }

    if (password) operator.password = password;

    if (isActive === false) {
      operator.isDeleted = true;
      operator.deletedAt = new Date();
    } else if (isActive === true) {
      operator.isDeleted = false;
      operator.deletedAt = null;
    }

    await operator.save();

    const result = await User.findById(operator._id).select("-password").populate("role");
    res.json({ success: true, message: "Operator updated successfully", data: result });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActiveOperators = async (_req: Request, res: Response) => {
  try {
    const operatorRole = await getOperatorRole();
    if (!operatorRole) {
      return res.json({ success: true, data: [] });
    }

    const operators = await User.find({
      role: operatorRole._id as mongoose.Types.ObjectId,
      isDeleted: false,
    } as any)
      .select("name empCode")
      .sort({ name: 1 });

    res.json({ success: true, data: operators });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { operatorCrudController as operator };
