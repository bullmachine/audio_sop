import { Request, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import mongoose from 'mongoose';
import Stage from '../models/Stage';
import { AuthRequest } from '../types/express'; 

// Common headers for Excel operations
const PROCESS_HEADERS = {
    PROCESS: 'Stage Name',
    STATUS: 'Status',
    CREATED_AT: 'Created At'
};

// Common headers for Stage Rate Excel operations
const PROCESS_RATE_HEADERS = {
    PROCESS: 'Stage Name',
    TYPE: 'Type',
    UNIT: 'Unit',
    RATE_PER_UNIT: 'Rate Per Unit',
};

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only Excel files
        if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'));
        }
    }
});

export class StageController {
    // Get all processes
    static getAll = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) ;
            const search = req.query.search as string || '';

            const skip = (page - 1) * limit;

            // Build search query
            const query: any = {
                isDeleted: false,
                isActive: true
            };

            if (search) {
                query.stage = { $regex: search, $options: 'i' };
            }

            const processes = await Stage.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Stage.countDocuments(query);

            res.status(200).json({
                success: true,
                message: 'Processes retrieved successfully',
                data: processes,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve processes',
                error: error.message
            });
        }
    };

    // Get stage by ID
    static getById = async (req: Request, res: Response) => {
        try {
            const stage = await Stage.findOne({
                _id: req.params.id,
                isDeleted: false,
                isActive: true
            });

            if (!stage) {
                return res.status(404).json({
                    success: false,
                    message: 'Stage not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Stage retrieved successfully',
                data: stage
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve stage',
                error: error.message
            });
        }
    };

    // Create new stage
    static create = async (req: Request, res: Response) => {
        try {
            const { stage, stage_description } = req.body;

            if (!stage) {
                return res.status(400).json({
                    success: false,
                    message: 'Stage name is required'
                });
            }

            // Check if stage already exists
            const existingProcess = await Stage.findOne({
                stage: stage.trim(),
                stage_description: stage_description.trim(),
                isDeleted: false
            });

            if (existingProcess) {
                return res.status(400).json({
                    success: false,
                    message: 'Stage already exists'
                });
            }

            const newProcess = new Stage({
                stage: stage.trim(),
                stage_description: stage_description.trim()
            });

            await newProcess.save();

            // Log the creation
            // await AuditService.logCreation({
            //     user_id: (req as any).user?.id || '',
            //     entity_type: 'Stage',
            //     entity_id: newProcess._id.toString(),
            //     new_data: newProcess,
            //     description: `Created new Stage: ${newProcess.stage}`,
            //     req: req as AuthRequest
            // });

            res.status(201).json({
                success: true,
                message: 'Stage created successfully',
                data: newProcess
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to create stage',
                error: error.message
            });
        }
    };

    // Update stage
    static update = async (req: Request, res: Response) => {
        try {
            const { stage, stage_description } = req.body;
            const stageId = req.params.id;

            if (!stage) {
                return res.status(400).json({
                    success: false,
                    message: 'Stage name is required'
                });
            }

            const existingProcess = await Stage.findOne({
                _id: stageId,
                isDeleted: false,
                isActive: true
            });

            if (!existingProcess) {
                return res.status(404).json({
                    success: false,
                    message: 'Stage not found'
                });
            }

            // Check if stage name already exists for another stage
            const duplicateProcess = await Stage.findOne({
                _id: { $ne: stageId },
                stage: stage.trim(),
                stage_description: stage_description.trim(),
                isDeleted: false
            });

            if (duplicateProcess) {
                return res.status(400).json({
                    success: false,
                    message: 'Stage name already exists'
                });
            }

            const oldData = { ...existingProcess.toObject() };
            existingProcess.stage = stage.trim();
            existingProcess.stage_description = stage_description.trim();
            await existingProcess.save();

            // Log the update
            // await AuditService.logUpdate({
            //     user_id: (req as any).user?.id || '',
            //     entity_type: 'Stage',
            //     entity_id: stageId,
            //     old_data: oldData,
            //     new_data: existingProcess,
            //     description: `Updated Stage: ${existingProcess.stage}`,
            //     req: req as AuthRequest
            // });

            res.status(200).json({
                success: true,
                message: 'Stage updated successfully',
                data: existingProcess
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to update stage',
                error: error.message
            });
        }
    };

    // Delete stage (soft delete)
    static delete = async (req: Request, res: Response) => {
        try {
            const stageId = req.params.id;

            const stage = await Stage.findOne({
                _id: stageId,
                isDeleted: false,
                isActive: true
            });

            if (!stage) {
                return res.status(404).json({
                    success: false,
                    message: 'Stage not found'
                });
            }

            const oldData = { ...stage.toObject() };
            stage.isDeleted = true;
            stage.deletedAt = new Date();
            stage.isActive = false;
            await stage.save();

            // Log the deletion
            // await AuditService.logDeletion({
            //     user_id: (req as any).user?.id || '',
            //     entity_type: 'Stage',
            //     entity_id: stageId,
            //     old_data: oldData,
            //     description: `Deleted Stage: ${stage.stage}`,
            //     req: req as AuthRequest
            // });

            res.status(200).json({
                success: true,
                message: 'Stage deleted successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete stage',
                error: error.message
            });
        }
    };

    // Upload Excel file with processes
    static uploadExcel = [
        upload.single('file'),
        async (req: Request, res: Response) => {
            try {
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: 'No file uploaded'
                    });
                }

                // Read Excel file
                const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet);

                if (!data || data.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'No data found in Excel file'
                    });
                }

                const processes: string[] = [];
                const errors: string[] = [];
                const duplicates: string[] = [];

                // Stage each row
                for (let i = 0; i < data.length; i++) {
                    const row = data[i] as any;
                    
                    // Try to find stage column using common headers
                    const processName = row[PROCESS_HEADERS.PROCESS] || 
                                       row.stage || row.Stage || row.PROCESS || 
                                       row.name || row.Name || row.NAME ||
                                       row['Stage Name'] || row['stage name'];

                    if (!processName || typeof processName !== 'string' || processName.trim() === '') {
                        errors.push(`Row ${i + 1}: No valid stage name found. Expected header: "${PROCESS_HEADERS.PROCESS}"`);
                        continue;
                    }

                    const trimmedProcess = processName.trim();
                    
                    // Check for duplicates in upload
                    if (processes.includes(trimmedProcess)) {
                        duplicates.push(`Row ${i + 1}: "${trimmedProcess}" is duplicated in the file`);
                        continue;
                    }

                    // Check if stage already exists in database
                    const existingProcess = await Stage.findOne({
                        stage: trimmedProcess,
                        isDeleted: false
                    });

                    if (existingProcess) {
                        duplicates.push(`Row ${i + 1}: "${trimmedProcess}" already exists in database`);
                        continue;
                    }

                    processes.push(trimmedProcess);
                }

                // Create new processes
                const createdProcesses = [];
                for (const processName of processes) {
                    try {
                        const newProcess = new Stage({ stage: processName });
                        await newProcess.save();
                        createdProcesses.push(newProcess);

                        // Log the creation
                        // await AuditService.logCreation({
                        //     user_id: (req as any).user?.id || '',
                        //     entity_type: 'Stage',
                        //     entity_id: newProcess._id.toString(),
                        //     new_data: newProcess,
                        //     description: `Created new Stage via Excel upload: ${newProcess.stage}`,
                        //     req: req as AuthRequest
                        // });
                    } catch (error: any) {
                        errors.push(`Failed to create stage "${processName}": ${error.message}`);
                    }
                }

                res.status(200).json({
                    success: true,
                    message: 'Excel file processed successfully',
                    data: {
                        created: createdProcesses,
                        summary: {
                            totalRows: data.length,
                            successful: createdProcesses.length,
                            duplicates: duplicates.length,
                            errors: errors.length
                        },
                        duplicates,
                        errors
                    }
                });
            } catch (error: any) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to stage Excel file',
                    error: error.message
                });
            }
        }
    ];

    // Download sample Excel template
    static downloadTemplate = async (req: Request, res: Response) => {
        try {
            // Create sample data with common headers
            const sampleData = [
                { 
                    [PROCESS_HEADERS.PROCESS]: 'Welding',
                    [PROCESS_HEADERS.STATUS]: 'Active',
                    [PROCESS_HEADERS.CREATED_AT]: new Date().toISOString()
                },
                { 
                    [PROCESS_HEADERS.PROCESS]: 'Assembly',
                    [PROCESS_HEADERS.STATUS]: 'Active',
                    [PROCESS_HEADERS.CREATED_AT]: new Date().toISOString()
                },
                { 
                    [PROCESS_HEADERS.PROCESS]: 'Painting',
                    [PROCESS_HEADERS.STATUS]: 'Active',
                    [PROCESS_HEADERS.CREATED_AT]: new Date().toISOString()
                },
                { 
                    [PROCESS_HEADERS.PROCESS]: 'Testing',
                    [PROCESS_HEADERS.STATUS]: 'Active',
                    [PROCESS_HEADERS.CREATED_AT]: new Date().toISOString()
                },
                { 
                    [PROCESS_HEADERS.PROCESS]: 'Packaging',
                    [PROCESS_HEADERS.STATUS]: 'Active',
                    [PROCESS_HEADERS.CREATED_AT]: new Date().toISOString()
                }
            ];

            // Create workbook
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(sampleData);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Processes');

            // Set column widths
            worksheet['!cols'] = [
                { width: 30 }, // Stage Name
                { width: 15 }, // Status
                { width: 20 }  // Created At
            ];

            // Generate buffer
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            // Set headers for file download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=process_template.xlsx');
            
            res.send(buffer);
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to download template',
                error: error.message
            });
        }
    };

    // Export existing processes with common headers
    static exportProcesses = async (req: Request, res: Response) => {
        try {
            const processes = await Stage.find({ isDeleted: false })
                .sort({ createdAt: -1 });

            // Transform data to use common headers
            const exportData = processes.map(stage => ({
                [PROCESS_HEADERS.PROCESS]: stage.stage,
                [PROCESS_HEADERS.STATUS]: stage.isActive ? 'Active' : 'Inactive',
                [PROCESS_HEADERS.CREATED_AT]: stage.createdAt.toISOString()
            }));

            // Create workbook
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Processes');

            // Set column widths
            worksheet['!cols'] = [
                { width: 30 }, // Stage Name
                { width: 15 }, // Status
                { width: 20 }  // Created At
            ];

            // Generate buffer
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            // Set headers for file download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=processes_export.xlsx');
            
            res.send(buffer);
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to export processes',
                error: error.message
            });
        }
    };
}
