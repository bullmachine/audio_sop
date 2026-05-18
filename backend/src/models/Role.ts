import mongoose, { Document, Schema, Model } from "mongoose";

export interface IRole extends Document {
    role: string;
    description: string;
    status: boolean;
}

const roleSchema: Schema<IRole> = new mongoose.Schema(
    {
        role: {
            type: String,
            required: [true, "Please add a role"],
            unique: true,
        },
        description: {
            type: String,
            required: [true, "Please add a description"], 
        },
        status: {
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
)

const Role: Model<IRole> = mongoose.model<IRole>("Role", roleSchema);
export default Role;