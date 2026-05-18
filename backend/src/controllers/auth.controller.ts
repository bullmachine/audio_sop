// src/controllers/authController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../types/express';
import mongoose from 'mongoose';
import User from '../models/User';
import UserPermission from '../models/UserPermission';
import Permission from '../models/Permission';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/token';

let refreshTokens: string[] = []; // In prod, store in DB or Redis

export const register = async (req: Request, res: Response) => {
  try {
    const { name, empCode, email, mobile, password, plant } = req.body;
    
    // Check required fields
    if (!name || !empCode || !email || !mobile || !password || !plant) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { empCode }, { mobile }],
    });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      empCode,
      email,
      mobile,
      password,
      plant,
    });
    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: (err as Error).message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { empCode, password } = req.body;

    // Explicitly select password and populate role
    const user = await User.findOne({ empCode, isDeleted: false }).select(
      "+password"
    ).populate('role');
    
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    refreshTokens.push(refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      path: "/api/auth/refresh",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,  
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: (err as Error).message,
    });
  }
};

export const refreshToken = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  try {
    const payload: any = verifyRefreshToken(refreshToken);
    const token = generateAccessToken({ id: payload.id });

    res.json({ token });
  } catch (err) {
    res.status(403).json({
      message: "Invalid refresh token",
      error: (err as Error).message,
    });
  }
};

export const logout = (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  refreshTokens = refreshTokens.filter((t) => t !== token);

  res.clearCookie("refreshToken", {
    path: "/api/auth/refresh",
  });

  res.json({ message: "Logged out successfully" });
};


export const verifyToken = (req: Request, res: Response) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>

    const payload = verifyAccessToken(token);

    // You can return user info or just a success message
    return res.json({
      message: "Token is valid",
      user: payload,
    });
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error: (err as Error).message,
    });
  }
};

export const getUserPermissions = async (req: Request, res: Response) => {
  try {
    // Enterprise-standard token validation
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header required"
      });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    if (!payload || !payload.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token"
      });
    }

    // Get user details to check for super admin role
    const user = await User.findById(payload.id).populate('role');
    
    // Super admin bypass - return all permissions if user is super admin
    // Check both direct role assignment and role object
    const userRole = user?.role as any; 
    
    // Normalize role comparison - handle both string and object cases
    let normalizedRole = '';
    if (typeof userRole === 'string') {
      normalizedRole = userRole.toLowerCase().replace(/\s+/g, '');
    } else if (userRole && userRole.role) {
      normalizedRole = userRole.role.toLowerCase().replace(/\s+/g, '');
    }
    
    if (normalizedRole === 'superadmin') {
      // Get all active permissions for super admin
      const allPermissions = await Permission.find({ active: true });
      return res.json({
        success: true,
        permissions: allPermissions,
        message: "Super admin - all permissions retrieved"
      });
    }

    // Convert string ID to ObjectId and use models directly with type assertion
    const userId = new mongoose.Types.ObjectId(payload.id) as any;
    
    const userPermissionDoc = await UserPermission.findOne({
      user: userId,
      active: true
    });
    
    if (!userPermissionDoc || !userPermissionDoc.permissions) {
      return res.json({
        success: true,
        permissions: [],
        message: "No permissions assigned to user"
      });
    }

    // Get actual permission documents with type assertion
    const permissionDocs = await Permission.find({
      _id: { $in: userPermissionDoc.permissions as any },
      active: true
    });
    
    return res.json({
      success: true,
      permissions: permissionDocs,
      message: "Permissions retrieved successfully"
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, mobile, plant, currentPassword, newPassword, confirmPassword } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // If password change is requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to change password"
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect"
        });
      }

      // Check if new password matches confirmation
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "New password and confirmation do not match"
        });
      }

      // Validate new password length
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long"
        });
      }

      // Update password
      user.password = newPassword;
    }

    // Update profile information if provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (mobile !== undefined) user.mobile = mobile;
    if (plant !== undefined) user.plant = plant;

    // Check for unique constraints if email or mobile are being updated
    if (email !== undefined || mobile !== undefined) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: user._id } },
          {
            $or: [
              ...(email !== undefined ? [{ email }] : []),
              ...(mobile !== undefined ? [{ mobile }] : [])
            ]
          }
        ],
        isDeleted: false
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email or mobile number already in use"
        });
      }
    }

    await user.save();

    // Return updated user data (excluding password)
    const updatedUser = await User.findById(user._id).populate('role');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found after update"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        empCode: updatedUser.empCode,
        plant: updatedUser.plant,
        role: updatedUser.role
      }
    });

  } catch (error: any) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

export const getCurrentUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const user = await User.findById(req.user.id).populate('role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        empCode: user.empCode,
        plant: user.plant,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};