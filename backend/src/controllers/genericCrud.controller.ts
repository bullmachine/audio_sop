import { Request, Response } from 'express';
import { Document, Model } from 'mongoose'; 

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    sortField?: string;
    sortOrder?: string;
  };
}

export class GenericCrudController<T extends Document> {
  private populateFields: string[] = [];

  constructor(private model: Model<T>, populateFields: string[] = []) {
    this.populateFields = populateFields;
  }

  // Helper method to get record identifier for audit logging
  private getRecordIdentifier(record: any): string {
    // Try common identifier fields
    if (record.operation) return record.operation;
    if (record.name) return record.name;
    if (record.email) return record.email;
    if (record.title) return record.title;
    if (record._id) return record._id.toString();
    return 'Unknown';
  }

  // GET / - Get all records with pagination and search
  getAll = async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit,
        search,
        sortField = '_id',
        sortOrder = 'desc'
      } = req.query as PaginationParams;

      const pageNum = parseInt(page.toString(), 10);
      const limitNum = limit ? parseInt(limit.toString(), 10) : undefined;
      const skip = limitNum ? (pageNum - 1) * limitNum : 0;

      // Build search query
      const searchQuery: any = {};
      
      // Check if model has status field for soft delete filtering
      const schemaPaths = Object.keys(this.model.schema.paths);
      const hasStatusField = schemaPaths.includes('status');
      const hasIsDeletedField = schemaPaths.includes('isDeleted');
      const hasActiveField = schemaPaths.includes('active');
      
      // Add status filter to only show active records (for soft delete)
      if (hasStatusField) {
        searchQuery.status = true;
      } else if (hasIsDeletedField) {
        searchQuery.isDeleted = false;
      } else if (hasActiveField) {
        searchQuery.active = true;
      }
      
      if (search) {
        // Get model schema fields to search in
        const searchableFields = schemaPaths.filter(field => 
          this.model.schema.paths[field].instance === 'String'
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

      // Dynamic population based on constructor parameters and model schema
      let query = this.model.find(searchQuery);
      
      // Populate fields specified in constructor (if they exist in schema)
      this.populateFields.forEach(field => {
        if (schemaPaths.includes(field)) {
          query = query.populate(field);
        }
      });
      
      // Special handling for RoleUser model to populate users as well
      if (this.model.modelName === 'RoleUser' && schemaPaths.includes('users')) {
        query = query.populate('users');
      }

      // Execute query with conditional pagination
      const queryPromise = query.sort(sort);
      if (limitNum) {
        queryPromise.skip(skip).limit(limitNum);
      }

      const [data, total] = await Promise.all([
        queryPromise.exec(),
        this.model.countDocuments(searchQuery)
      ]);

      const response: PaginatedResponse<T> = {
        success: true,
        data,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum || total, // Use total as limit when no limit specified
          totalPages: limitNum ? Math.ceil(total / limitNum) : 1,
          sortField,
          sortOrder
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

  // GET /:id - Get single record by ID
  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const record = await this.model.findById(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Record not found'
        });
      }

      res.json({
        success: true,
        data: record
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // POST / - Create new record
  create = async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const newRecord = await this.model.create(data);

      // Log the creation
      // await AuditService.logCreation({
      //   user_id: (req as any).user?.id || '',
      //   entity_type: this.model.modelName as any,
      //   entity_id: (newRecord as any)._id.toString(),
      //   new_data: newRecord,
      //   description: `Created new ${this.model.modelName}: ${this.getRecordIdentifier(newRecord)}`,
      //   req: req as any
      // });

      res.status(201).json({
        success: true,
        message: 'Record created successfully',
        data: newRecord
      });
    } catch (error: any) {
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Record already exists'
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

  // PUT /:id - Update record by ID
  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      // Get old record for audit
      const oldRecord = await this.model.findById(id);
      if (!oldRecord) {
        return res.status(404).json({
          success: false,
          message: 'Record not found'
        });
      }

      const updatedRecord = await this.model.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      );

      // Log the update
      // await AuditService.logUpdate({
      //   user_id: (req as any).user?.id || '',
      //   entity_type: this.model.modelName as any,
      //   entity_id: id,
      //   old_data: oldRecord,
      //   new_data: updatedRecord,
      //   description: `Updated ${this.model.modelName}: ${this.getRecordIdentifier(updatedRecord)}`,
      //   req: req as any
      // });

      res.json({
        success: true,
        message: 'Record updated successfully',
        data: updatedRecord
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

  // DELETE /:id - Delete record by ID (soft delete if status field exists)
  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Get record for audit before deletion
      const recordToDelete = await this.model.findById(id);
      if (!recordToDelete) {
        return res.status(404).json({
          success: false,
          message: 'Record not found'
        });
      }

      // Check if model has status field for soft delete
      const schemaPaths = Object.keys(this.model.schema.paths);
      const hasStatusField = schemaPaths.includes('status');
      const hasIsDeletedField = schemaPaths.includes('isDeleted');
      const hasActiveField = schemaPaths.includes('active');

      let deletedRecord;
      if (hasStatusField) {
        // Soft delete using status field
        deletedRecord = await this.model.findByIdAndUpdate(
          id,
          { status: false },
          { new: true }
        );
      } else if (hasIsDeletedField) {
        // Soft delete using isDeleted field
        deletedRecord = await this.model.findByIdAndUpdate(
          id,
          { isDeleted: true, deletedAt: new Date() },
          { new: true }
        );
      } else if (hasActiveField) {
        // Soft delete using active field
        deletedRecord = await this.model.findByIdAndUpdate(
          id,
          { active: false },
          { new: true }
        );
      } else {
        // Hard delete
        deletedRecord = await this.model.findByIdAndDelete(id);
      }

      // Log the deletion
      // await AuditService.logDeletion({
      //   user_id: (req as any).user?.id || '',
      //   entity_type: this.model.modelName as any,
      //   entity_id: id,
      //   old_data: recordToDelete,
      //   description: `Deleted ${this.model.modelName}: ${this.getRecordIdentifier(recordToDelete)}`,
      //   req: req as any
      // });

      res.json({
        success: true,
        message: 'Record deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // GET /search - Search records
  search = async (req: Request, res: Response) => {
    try {
      const { search, page = 1, limit = 10, sortField = '_id', sortOrder = 'desc' } = req.query;

      if (!search) {
        return this.getAll(req, res);
      }

      // Reuse getAll logic with search parameter
      req.query.search = search;
      return this.getAll(req, res);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // POST /:id/restore - Restore soft deleted record
  restore = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Check if model has isDeleted field
      const schemaPaths = Object.keys(this.model.schema.paths);
      const hasIsDeletedField = schemaPaths.includes('isDeleted');
      const hasDeletedAtField = schemaPaths.includes('deletedAt');

      if (!hasIsDeletedField) {
        return res.status(400).json({
          success: false,
          message: 'Model does not support restore operation'
        });
      }

      const updateData: any = { isDeleted: false };
      
      // Also restore active status if model has isActive field
      if (schemaPaths.includes('isActive')) {
        updateData.isActive = true;
      }
      
      // Clear deletedAt timestamp if available
      if (hasDeletedAtField) {
        updateData.deletedAt = null;
      }

      const restoredRecord = await this.model.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!restoredRecord) {
        return res.status(404).json({
          success: false,
          message: 'Record not found'
        });
      }

      res.json({
        success: true,
        message: 'Record restored successfully',
        data: restoredRecord
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // PATCH /:id/toggle - Toggle active status
  toggleActive = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Check if model has isActive field
      const schemaPaths = Object.keys(this.model.schema.paths);
      const hasIsActiveField = schemaPaths.includes('isActive');

      if (!hasIsActiveField) {
        return res.status(400).json({
          success: false,
          message: 'Model does not support active status toggle'
        });
      }

      const record = await this.model.findById(id);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Record not found'
        });
      }

      const currentStatus = (record as any).isActive;
      const updatedRecord = await this.model.findByIdAndUpdate(
        id,
        { isActive: !currentStatus },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: `Record ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        data: updatedRecord
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // GET /active - Get only active records
  getActive = async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortField = '_id',
        sortOrder = 'desc'
      } = req.query as PaginationParams;

      const pageNum = parseInt(page.toString(), 10);
      const limitNum = parseInt(limit.toString(), 10);
      const skip = (pageNum - 1) * limitNum;

      // Build search query for active records only
      const searchQuery: any = {};
      
      // Check if model has status field for filtering
      const schemaPaths = Object.keys(this.model.schema.paths);
      const hasStatusField = schemaPaths.includes('status');
      const hasIsDeletedField = schemaPaths.includes('isDeleted');
      const hasActiveField = schemaPaths.includes('active') || schemaPaths.includes('isActive');
      
      // Add status filter to only show active records
      if (hasStatusField) {
        searchQuery.status = true;
      } else if (hasIsDeletedField) {
        searchQuery.isDeleted = false;
      } else if (hasActiveField) {
        searchQuery.active = true;
        searchQuery.isActive = true;
      }
      
      if (search) {
        // Get model schema fields to search in
        const searchableFields = schemaPaths.filter(field => 
          this.model.schema.paths[field].instance === 'String'
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

      // Execute query with pagination
      const [data, total] = await Promise.all([
        this.model
          .find(searchQuery)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .exec(),
        this.model.countDocuments(searchQuery)
      ]);

      const response: PaginatedResponse<T> = {
        success: true,
        data,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          sortField,
          sortOrder
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
}
