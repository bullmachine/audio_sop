import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPermission extends Document {
    name: string;
    description: string;
    module: string;
    action: string;
    isHeading: boolean;
    active: boolean;
}

const permissionSchema: Schema<IPermission> = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        module: {
            type: String,
            required: true,
        },
        action: {
            type: String,
            required: true,
            enum: ['read', 'view', 'delete', 'create', 'update','heading'],
        },
        isHeading: {
            type: Boolean,
            default: false,
        },
        active: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    }
);

const Permission: Model<IPermission> = mongoose.model<IPermission>("Permission", permissionSchema);
export default Permission;
