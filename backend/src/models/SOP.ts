import mongoose, { Document, Schema } from "mongoose";

// Interface for SOP document
export interface ISOP extends Document {
    sop_name: string;
    sop_description?: string;
    isActive: boolean;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// Schema definition
const sopSchema: Schema<ISOP> = new mongoose.Schema(
    {
        sop_name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true
        },
        sop_description: {
            type: String,
            trim: true,
            required: false
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc: any, ret: any) {
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Add compound index for active and non-deleted SOPs
sopSchema.index({ isActive: 1, isDeleted: 1 });

// Create and export the model
const SOP = mongoose.model<ISOP>('SOP', sopSchema);
export default SOP;
