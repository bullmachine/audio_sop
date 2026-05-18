import { GenericCrudController } from './genericCrud.controller';
import User from '../models/User';
import { Response } from 'express';
import { AuthRequest } from '../types/express'; 

// Create a generic CRUD controller for User model
const userController = new GenericCrudController(User);

// Get current authenticated user with populated role and level
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const user = await User.findById(userId).populate('role');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        
        // Add levelRole to the user object for frontend compatibility
        const userWithLevel = {
            ...user.toObject(),
            role: user.role ? {
                ...(user.role as any).toObject()
            } : null
        };

        res.json({
            success: true,
            data: userWithLevel
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Export all CRUD operations
export const getAllUsers = userController.getAll;
export const getUserById = userController.getById;
export const createUser = userController.create;
export const updateUser = userController.update;
export const deleteUser = userController.delete;
export const searchUsers = userController.search;
