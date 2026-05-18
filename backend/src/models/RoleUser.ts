import mongoose, { Document, Schema, Model } from "mongoose";

export interface IRoleUser extends Document {
    role: mongoose.Schema.Types.ObjectId;
    users: mongoose.Schema.Types.ObjectId[];
    active: boolean;
}

const roleUserSchema: Schema<IRoleUser> = new mongoose.Schema(
    {
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            required: true,
        },
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
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

const RoleUser: Model<IRoleUser> = mongoose.model<IRoleUser>("RoleUser", roleUserSchema);
export default RoleUser;
