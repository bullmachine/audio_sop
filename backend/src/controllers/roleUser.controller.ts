import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { GenericCrudController } from './genericCrud.controller';
import RoleUser from '../models/RoleUser';
import User from '../models/User';

// Create a generic CRUD controller for RoleUser model
const roleUserController = new GenericCrudController(RoleUser, ['role']);

// Custom create function that also assigns role to users
export const createRoleUser = async (req: Request, res: Response) => {
    try {
        const { role, users } = req.body;

        // Create the RoleUser record
        const newRoleUser = await RoleUser.create({ role, users });

        // Update each user to assign the role
        await User.updateMany(
            { _id: { $in: users.map((user: any) => new Types.ObjectId(user)) } },
            { role: new Types.ObjectId(role) }
        );

        res.status(201).json({
            success: true,
            message: 'RoleUser created successfully and role assigned to users',
            data: newRoleUser
        });
    } catch (error: any) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'RoleUser already exists'
            });
        }

        // Handle validation error
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Custom update function that also updates role assignments for users
export const updateRoleUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role, users } = req.body;

        // Get the existing RoleUser to compare old and new users
        const existingRoleUser = await RoleUser.findById(id);
        if (!existingRoleUser) {
            return res.status(404).json({
                success: false,
                message: 'RoleUser not found'
            });
        }

        const oldUsers = existingRoleUser.users.map((user: any) => new Types.ObjectId(user));
        const newUsers = (users || []).map((user: any) => new Types.ObjectId(user));

        // Update the RoleUser record
        const updatedRoleUser = await RoleUser.findByIdAndUpdate(
            id,
            { role, users: newUsers },
            { new: true, runValidators: true }
        );

        // Remove role from users who are no longer in the list
        const usersToRemove = oldUsers.filter((oldUserId: Types.ObjectId) =>
            !newUsers.some((newUserId: Types.ObjectId) => newUserId.equals(oldUserId))
        );
        if (usersToRemove.length > 0) {
            await User.updateMany(
                { _id: { $in: usersToRemove } },
                { $unset: { role: 1 } }
            );
        }

        // Assign role to new users
        const usersToAdd = newUsers.filter((newUserId: Types.ObjectId) =>
            oldUsers.some((oldUserId: Types.ObjectId) => oldUserId.equals(newUserId))
        );
        if (usersToAdd.length > 0) {
            await User.updateMany(
                { _id: { $in: usersToAdd } },
                { role: new Types.ObjectId(role) }
            );
        }

        res.json({
            success: true,
            message: 'RoleUser updated successfully and role assignments updated',
            data: updatedRoleUser
        });
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Custom delete function that also removes role from users
export const deleteRoleUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Get the RoleUser before deleting to remove role from users
        const roleUserToDelete = await RoleUser.findById(id);
        if (!roleUserToDelete) {
            return res.status(404).json({
                success: false,
                message: 'RoleUser not found'
            });
        }

        // Remove role from all users in this RoleUser
        await User.updateMany(
            { _id: { $in: roleUserToDelete.users.map((user: any) => new Types.ObjectId(user)) } },
            { $unset: { role: 1 } }
        );

        // Soft delete the RoleUser
        const deletedRoleUser = await RoleUser.findByIdAndUpdate(
            id,
            { active: false },
            { new: true }
        );

        res.json({
            success: true,
            message: 'RoleUser deleted successfully and role removed from users'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Export other CRUD operations from generic controller
export const getAllRoleUsers = roleUserController.getAll;
export const getRoleUserById = roleUserController.getById;
export const searchRoleUsers = roleUserController.search;
