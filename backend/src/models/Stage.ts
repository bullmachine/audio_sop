import mongoose, { Document, Schema } from "mongoose";

// Interface for Process document
export interface IStage extends Document {
    stage: string;
    stage_description: any;
    isActive: boolean;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// Schema definition
const stageSchema: Schema<IStage> = new mongoose.Schema(
    {
        stage: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true
        },
        stage_description: {
            type: Schema.Types.Mixed,
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

// Add compound index for active and non-deleted processes
stageSchema.index({ isActive: 1, isDeleted: 1 });

// Create and export the model
const Stage = mongoose.model<IStage>('Stage', stageSchema);
export default Stage;
