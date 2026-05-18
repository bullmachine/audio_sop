import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUserPermission extends Document {
    user: mongoose.Schema.Types.ObjectId;
    permissions: mongoose.Schema.Types.ObjectId[];
    active: boolean;
}

const userPermissionSchema: Schema<IUserPermission> = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        permissions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Permission',
            required: true,
        }],
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

const UserPermission: Model<IUserPermission> = mongoose.model<IUserPermission>("UserPermission", userPermissionSchema);
export default UserPermission;
