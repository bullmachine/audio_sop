import { Request, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import mongoose from 'mongoose';
import SOP from '../models/SOP';
import { AuthRequest } from '../types/express';

// Common headers for Excel operations
const SOP_HEADERS = {
    SOP_NAME: 'SOP Name',
    SOP_DESCRIPTION: 'SOP Description',
    STATUS: 'Status',
    CREATED_AT: 'Created At'
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

export class SOPController {
    // Get all SOPs
    static getAll = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string);
            const search = req.query.search as string || '';

            const skip = (page - 1) * limit;

            // Build search query
            const query: any = {
                isDeleted: false,
                isActive: true
            };

            if (search) {
                query.sop_name = { $regex: search, $options: 'i' };
            }

            const sops = await SOP.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await SOP.countDocuments(query);

            res.status(200).json({
                success: true,
                message: 'SOPs retrieved successfully',
                data: sops,
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
                message: 'Failed to retrieve SOPs',
                error: error.message
            });
        }
    };

    // Get SOP by ID
    static getById = async (req: Request, res: Response) => {
        try {
            const sop = await SOP.findOne({
                _id: req.params.id,
                isDeleted: false,
                isActive: true
            });

            if (!sop) {
                return res.status(404).json({
                    success: false,
                    message: 'SOP not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'SOP retrieved successfully',
                data: sop
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve SOP',
                error: error.message
            });
        }
    };

    // Create new SOP
    static create = async (req: Request, res: Response) => {
        try {
            const { sop_name, sop_description } = req.body;

            if (!sop_name) {
                return res.status(400).json({
                    success: false,
                    message: 'SOP name is required'
                });
            }

            // Check if SOP already exists
            const existingSOP = await SOP.findOne({
                sop_name: sop_name.trim(),
                isDeleted: false
            });

            if (existingSOP) {
                return res.status(400).json({
                    success: false,
                    message: 'SOP already exists'
                });
            }

            const newSOP = new SOP({
                sop_name: sop_name.trim(),
                sop_description: sop_description?.trim()
            });

            await newSOP.save();

            res.status(201).json({
                success: true,
                message: 'SOP created successfully',
                data: newSOP
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to create SOP',
                error: error.message
            });
        }
    };

    // Update SOP
    static update = async (req: Request, res: Response) => {
        try {
            const { sop_name, sop_description } = req.body;
            const sopId = req.params.id;

            if (!sop_name) {
                return res.status(400).json({
                    success: false,
                    message: 'SOP name is required'
                });
            }

            const existingSOP = await SOP.findOne({
                _id: sopId,
                isDeleted: false,
                isActive: true
            });

            if (!existingSOP) {
                return res.status(404).json({
                    success: false,
                    message: 'SOP not found'
                });
            }

            // Check if SOP name already exists for another SOP
            const duplicateSOP = await SOP.findOne({
                _id: { $ne: sopId },
                sop_name: sop_name.trim(),
                isDeleted: false
            });

            if (duplicateSOP) {
                return res.status(400).json({
                    success: false,
                    message: 'SOP name already exists'
                });
            }

            existingSOP.sop_name = sop_name.trim();
            existingSOP.sop_description = sop_description?.trim();
            await existingSOP.save();

            res.status(200).json({
                success: true,
                message: 'SOP updated successfully',
                data: existingSOP
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to update SOP',
                error: error.message
            });
        }
    };

    // Delete SOP (soft delete)
    static delete = async (req: Request, res: Response) => {
        try {
            const sopId = req.params.id;

            const sop = await SOP.findOne({
                _id: sopId,
                isDeleted: false,
                isActive: true
            });

            if (!sop) {
                return res.status(404).json({
                    success: false,
                    message: 'SOP not found'
                });
            }

            sop.isDeleted = true;
            sop.deletedAt = new Date();
            sop.isActive = false;
            await sop.save();

            res.status(200).json({
                success: true,
                message: 'SOP deleted successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete SOP',
                error: error.message
            });
        }
    };

    // Upload Excel file with SOPs
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

                const sops: string[] = [];
                const errors: string[] = [];
                const duplicates: string[] = [];

                // Process each row
                for (let i = 0; i < data.length; i++) {
                    const row = data[i] as any;

                    // Try to find SOP name column using common headers
                    const sopName = row[SOP_HEADERS.SOP_NAME] ||
                                   row.sop_name || row['SOP Name'] || row['sop name'] ||
                                   row.name || row.Name || row.NAME ||
                                   row.SOP || row.sop;

                    if (!sopName || typeof sopName !== 'string' || sopName.trim() === '') {
                        errors.push(`Row ${i + 1}: No valid SOP name found. Expected header: "${SOP_HEADERS.SOP_NAME}"`);
                        continue;
                    }

                    const trimmedSOP = sopName.trim();

                    // Check for duplicates in upload
                    if (sops.includes(trimmedSOP)) {
                        duplicates.push(`Row ${i + 1}: "${trimmedSOP}" is duplicated in the file`);
                        continue;
                    }

                    // Check if SOP already exists in database
                    const existingSOP = await SOP.findOne({
                        sop_name: trimmedSOP,
                        isDeleted: false
                    });

                    if (existingSOP) {
                        duplicates.push(`Row ${i + 1}: "${trimmedSOP}" already exists in database`);
                        continue;
                    }

                    sops.push(trimmedSOP);
                }

                // Create new SOPs
                const createdSOPs = [];
                for (const sopName of sops) {
                    try {
                        const newSOP = new SOP({ sop_name: sopName });
                        await newSOP.save();
                        createdSOPs.push(newSOP);
                    } catch (error: any) {
                        errors.push(`Failed to create SOP "${sopName}": ${error.message}`);
                    }
                }

                res.status(200).json({
                    success: true,
                    message: 'Excel file processed successfully',
                    data: {
                        created: createdSOPs,
                        summary: {
                            totalRows: data.length,
                            successful: createdSOPs.length,
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
                    message: 'Failed to process Excel file',
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
                    [SOP_HEADERS.SOP_NAME]: 'Welding Procedure',
                    [SOP_HEADERS.SOP_DESCRIPTION]: 'Standard welding procedure',
                    [SOP_HEADERS.STATUS]: 'Active',
                    [SOP_HEADERS.CREATED_AT]: new Date().toISOString()
                },
                {
                    [SOP_HEADERS.SOP_NAME]: 'Assembly Process',
                    [SOP_HEADERS.SOP_DESCRIPTION]: 'Assembly line process',
                    [SOP_HEADERS.STATUS]: 'Active',
                    [SOP_HEADERS.CREATED_AT]: new Date().toISOString()
                },
                {
                    [SOP_HEADERS.SOP_NAME]: 'Quality Check',
                    [SOP_HEADERS.SOP_DESCRIPTION]: 'Quality control procedure',
                    [SOP_HEADERS.STATUS]: 'Active',
                    [SOP_HEADERS.CREATED_AT]: new Date().toISOString()
                }
            ];

            // Create workbook
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(sampleData);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'SOPs');

            // Set column widths
            worksheet['!cols'] = [
                { width: 30 }, // SOP Name
                { width: 40 }, // SOP Description
                { width: 15 }, // Status
                { width: 20 }  // Created At
            ];

            // Generate buffer
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            // Set headers for file download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=sop_template.xlsx');

            res.send(buffer);
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to download template',
                error: error.message
            });
        }
    };

    // Export existing SOPs
    static exportSOPs = async (req: Request, res: Response) => {
        try {
            const sops = await SOP.find({ isDeleted: false })
                .sort({ createdAt: -1 });

            // Transform data to use common headers
            const exportData = sops.map(sop => ({
                [SOP_HEADERS.SOP_NAME]: sop.sop_name,
                [SOP_HEADERS.SOP_DESCRIPTION]: sop.sop_description || '',
                [SOP_HEADERS.STATUS]: sop.isActive ? 'Active' : 'Inactive',
                [SOP_HEADERS.CREATED_AT]: sop.createdAt.toISOString()
            }));

            // Create workbook
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'SOPs');

            // Set column widths
            worksheet['!cols'] = [
                { width: 30 }, // SOP Name
                { width: 40 }, // SOP Description
                { width: 15 }, // Status
                { width: 20 }  // Created At
            ];

            // Generate buffer
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            // Set headers for file download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=sops_export.xlsx');

            res.send(buffer);
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to export SOPs',
                error: error.message
            });
        }
    };
}
