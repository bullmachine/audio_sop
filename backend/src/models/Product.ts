import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
    name: string;
    description?: string;
    isActive: boolean;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema: Schema<IProduct> = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            unique: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
            toJSON: {
            transform(_doc, ret: Record<string, unknown>) {
                delete ret.__v;
                return ret;
            },
        },
    }
);

productSchema.index({ isActive: 1, isDeleted: 1 });

const Product = mongoose.model<IProduct>("Product", productSchema);
export default Product;
