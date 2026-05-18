import { Request, Response } from 'express';
import Permission from '../models/Permission';

// Utility class for permission generation (DRY principle)
class PermissionGenerator {
  static generatePermissionData(module: string, action: string, isHeading: boolean = false) {
    const permissionName = `${module}_${action}`;
    const actionDescription = action.charAt(0).toUpperCase() + action.slice(1);
    const description = `${actionDescription} ${module} permission`;
    
    return {
      name: permissionName,
      description: description,
      module: module,
      action: action,
      isHeading: isHeading || false,
      active: true
    };
  }

  static async createOrUpdatePermissions(
    module: string, 
    actions: string[], 
    isHeading: boolean = false,
    updateMode: boolean = false
  ) {
    const results = [];

    for (const action of actions) {
      const permissionData = this.generatePermissionData(module, action, isHeading);
      const existingPermission = await Permission.findOne({ name: permissionData.name });
      
      if (existingPermission) {
        if (updateMode) {
          // Update existing permission
          await Permission.findByIdAndUpdate(
            existingPermission._id,
            { 
              active: true,
              isHeading: isHeading || false,
              description: permissionData.description,
              action: action
            }
          );
          results.push(existingPermission);
        }
        // Skip if creating and already exists
      } else {
        // Create new permission
        const permission = await Permission.create(permissionData);
        results.push(permission);
      }
    }

    return results;
  }

  static validatePermissionRequest(module: string, actions: string[]) {
    if (!module || !actions || !Array.isArray(actions)) {
      return {
        isValid: false,
        message: 'Module name and actions array are required'
      };
    }
    return { isValid: true };
  }
}

// Create permissions automatically based on module and actions
export const createPermissions = async (req: Request, res: Response) => {
    try {
        const { module, isHeading, actions } = req.body;

        const validation = PermissionGenerator.validatePermissionRequest(module, actions);
        if (!validation.isValid) {
            return res.status(400).json({ 
                success: false, 
                message: validation.message 
            });
        }

        const createdPermissions = await PermissionGenerator.createOrUpdatePermissions(
            module, 
            actions, 
            isHeading, 
            false // create mode
        );

        return res.status(201).json({
            success: true,
            message: `Created ${createdPermissions.length} permissions for module: ${module}`,
            data: createdPermissions
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all permissions with pagination
export const getAllPermissions = async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit,
            search,
            sortField = '_id',
            sortOrder = 'desc'
        } = req.query as any;

        const pageNum = parseInt(page.toString(), 10);
        const limitNum = limit ? parseInt(limit.toString(), 10) : undefined;
        const skip = limitNum ? (pageNum - 1) * limitNum : 0;

        // Build search query
        const searchQuery: any = {};
        
        // Check if model has active field for soft delete filtering
        const schemaPaths = Object.keys(Permission.schema.paths);
        const hasActiveField = schemaPaths.includes('active');
        
        // Add status filter to only show active records (for soft delete)
        if (hasActiveField) {
            searchQuery.active = true;
        }
        
        if (search) {
            // Get model schema fields to search in
            const searchableFields = schemaPaths.filter(field => 
                Permission.schema.paths[field].instance === 'String'
            );

            if (searchableFields.length > 0) {
                searchQuery.$or = searchableFields.map(field => ({
                    [field]: { $regex: search, $options: 'i' }
                }));
            }
        }

        // Build sort object
        const sort: any = {};
        sort[sortField] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with or without pagination
        const query = Permission
            .find(searchQuery)
            .sort(sort);

        // Add pagination only if limit is provided
        if (limitNum) {
            query.skip(skip).limit(limitNum);
        }

        const data = await query.exec();
        const total = limitNum ? await Permission.countDocuments(searchQuery) : data.length;

        const response = {
            success: true,
            data,
            pagination: limitNum ? {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            } : undefined
        };

        res.json(response);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get permission by ID
export const getPermissionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const permission = await Permission.findById(id);

        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'Permission not found'
            });
        }

        res.json({
            success: true,
            data: permission
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update permission
export const updatePermission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const permission = await Permission.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'Permission not found'
            });
        }

        res.json({
            success: true,
            message: 'Permission updated successfully',
            data: permission
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete permission (soft delete)
export const deletePermission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if model has active field for soft delete
        const schemaPaths = Object.keys(Permission.schema.paths);
        const hasActiveField = schemaPaths.includes('active');

        let deletedPermission;
        if (hasActiveField) {
            // Soft delete using active field
            deletedPermission = await Permission.findByIdAndUpdate(
                id,
                { active: false },
                { new: true }
            );
        } else {
            // Hard delete
            deletedPermission = await Permission.findByIdAndDelete(id);
        }

        if (!deletedPermission) {
            return res.status(404).json({
                success: false,
                message: 'Permission not found'
            });
        }

        res.json({
            success: true,
            message: 'Permission deleted successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update permissions for a module
export const updateModulePermissions = async (req: Request, res: Response) => {
    try {
        const { module, isHeading, actions } = req.body;

        const validation = PermissionGenerator.validatePermissionRequest(module, actions);
        if (!validation.isValid) {
            return res.status(400).json({ 
                success: false, 
                message: validation.message 
            });
        }

        // First, deactivate all existing permissions for this module
        await Permission.updateMany(
            { module: module },
            { active: false }
        );

        const updatedPermissions = await PermissionGenerator.createOrUpdatePermissions(
            module, 
            actions, 
            isHeading, 
            true // update mode
        );

        return res.status(200).json({
            success: true,
            message: `Updated permissions for module: ${module}`,
            data: updatedPermissions
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search permissions
export const searchPermissions = async (req: Request, res: Response) => {
    try {
        const { query } = req.query as any;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchQuery = {
            active: true,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { module: { $regex: query, $options: 'i' } },
                { action: { $regex: query, $options: 'i' } }
            ]
        };

        const permissions = await Permission.find(searchQuery).limit(20);

        res.json({
            success: true,
            data: permissions
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};