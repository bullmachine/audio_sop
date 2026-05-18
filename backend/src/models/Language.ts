import mongoose, { Document, Schema } from "mongoose";

// Interface for Process document
export interface ILanguage extends Document {
    language: string; 
    isActive: boolean;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// Schema definition
const languageSchema: Schema<ILanguage> = new mongoose.Schema(
    {
        language: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true
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
languageSchema.index({ isActive: 1, isDeleted: 1 });

// Create and export the model
const Language = mongoose.model<ILanguage>('Language', languageSchema);
export default Language;
