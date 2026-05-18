import { Request, Response } from 'express';
import UserPermission from '../models/UserPermission';
import Permission from '../models/Permission';

// Get all user permissions with grouping
export const getAllUserPermissions = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query as any;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Get user's permissions with populated permission details
        const userPermissions = await UserPermission.findOne({ user: userId, active: true })
            .populate({
                path: 'permissions',
                populate: {
                    path: '',
                    match: { active: true }
                }
            })
            .exec();

        if (!userPermissions) {
            return res.json({
                success: true,
                data: [],
                groupedPermissions: {}
            });
        }

        // Group permissions by module and heading
        const groupedPermissions = userPermissions.permissions.reduce((acc: any, permission: any) => {
            const module = permission.module;
            const isHeading = permission.isHeading;

            if (!acc[module]) {
                acc[module] = {
                    module: module,
                    isHeading: isHeading,
                    permissions: []
                };
            }

            acc[module].permissions.push({
                _id: permission._id,
                name: permission.name,
                action: permission.action,
                description: permission.description
            });

            return acc;
        }, {});

        // Sort modules alphabetically
        const sortedModules = Object.keys(groupedPermissions).sort();

        res.json({
            success: true,
            data: userPermissions,
            groupedPermissions: sortedModules.reduce((acc: any, module: string) => {
                acc.push(groupedPermissions[module]);
                return acc;
            }, [])
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Assign permissions to user
export const assignPermissions = async (req: Request, res: Response) => {
    try {
        const { userId, permissionIds, userIds } = req.body;

        // Handle single user assignment
        if (userId && permissionIds) {
            if (!Array.isArray(permissionIds)) {
                return res.status(400).json({
                    success: false,
                    message: 'Permission IDs must be an array'
                });
            }

            // Check if user already has permissions
            const existingUserPermission = await UserPermission.findOne({ user: userId, active: true });

            if (existingUserPermission) {
                // Update existing permissions (enterprise standard)
                await UserPermission.updateOne(
                    { user: userId },
                    { $set: { permissions: permissionIds, updated_at: new Date() } }
                );
            } else {
                // Create new user permission assignment
                await UserPermission.create({
                    user: userId,
                    permissions: permissionIds,
                    active: true
                });
            }
        }
        // Handle multiple users assignment (role-based)
        else if (userIds && permissionIds) {
            if (!Array.isArray(userIds) || !Array.isArray(permissionIds)) {
                return res.status(400).json({
                    success: false,
                    message: 'User IDs and Permission IDs must be arrays'
                });
            }

            // Update permissions for multiple users
            for (const userIdToUpdate of userIds) {
                const existingUserPermission = await UserPermission.findOne({ user: userIdToUpdate, active: true });

                if (existingUserPermission) {
                    // Update existing permissions (enterprise standard)
                    await UserPermission.updateOne(
                        { user: userIdToUpdate },
                        { $set: { permissions: permissionIds, updated_at: new Date() } }
                    );
                } else {
                    // Create new user permission assignment
                    await UserPermission.create({
                        user: userIdToUpdate,
                        permissions: permissionIds,
                        active: true
                    });
                }
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'User ID(s) and permission IDs array are required'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Permissions assigned successfully'
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all users with their permissions (for admin view)
export const getAllUsersWithPermissions = async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            sortField = 'name',
            sortOrder = 'asc'
        } = req.query as any;

        const pageNum = parseInt(page.toString(), 10);
        const limitNum = parseInt(limit.toString(), 10);
        const skip = (pageNum - 1) * limitNum;

        // Build search query for users
        const searchQuery: any = {};

        if (search) {
            searchQuery.$or = [
                { 'user.name': { $regex: search, $options: 'i' } },
                { 'user.email': { $regex: search, $options: 'i' } }
            ];
        }

        // Get users with their permissions
        const [users, total] = await Promise.all([
            UserPermission.find(searchQuery)
                .populate('user')
                .populate('permissions')
                .sort(sortField === 'name' ? { 'user.name': sortOrder === 'asc' ? 1 : -1 } : { [sortField]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limitNum)
                .exec(),
            UserPermission.countDocuments(searchQuery)
        ]);

        const response = {
            success: true,
            data: users,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        };

        res.json(response);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Remove specific permission from user
export const removeUserPermission = async (req: Request, res: Response) => {
    try {
        const { userId, permissionId } = req.body;

        if (!userId || !permissionId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and permission ID are required'
            });
        }

        // Find the user permission document
        const userPermission = await UserPermission.findOne({ user: userId, active: true });

        if (!userPermission) {
            return res.status(404).json({
                success: false,
                message: 'User permission not found'
            });
        }
        await UserPermission.deleteOne({ user: userId });
        // Check if user has only this permission, then delete the entire record
        // if (userPermission.permissions.length === 1) {
        //     // Delete the entire user permission record
        //     await UserPermission.deleteOne({ user: userId });
        // } else {
        //     // Remove specific permission from user's permission array
        //     await UserPermission.updateOne(
        //         { user: userId },
        //         { $pull: { permissions: permissionId } }
        //     );
        // }

        res.json({
            success: true,
            message: 'Permission removed successfully'
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
