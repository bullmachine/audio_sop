import mongoose, { Document, Schema } from "mongoose";

export interface IAudioFile {
    fileName: string;
    originalName: string;
    filePath: string;
    mimeType: string;
    size: number;
    order: number;
}

export interface IAudioSop extends Document {
    product: mongoose.Types.ObjectId;
    stage: mongoose.Types.ObjectId;
    language: mongoose.Types.ObjectId;
    sop: mongoose.Types.ObjectId;
    operators: mongoose.Types.ObjectId[];
    files: IAudioFile[];
    createdBy?: mongoose.Types.ObjectId;
    isActive: boolean;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const audioFileSchema = new Schema<IAudioFile>(
    {
        fileName: { type: String, required: true },
        originalName: { type: String, required: true },
        filePath: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        order: { type: Number, required: true, default: 0 },
    },
    { _id: true }
);

const audioSopSchema: Schema<IAudioSop> = new mongoose.Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },
        stage: {
            type: Schema.Types.ObjectId,
            ref: "Stage",
            required: true,
            index: true,
        },
        language: {
            type: Schema.Types.ObjectId,
            ref: "Language",
            required: true,
            index: true,
        },
        sop: {
            type: Schema.Types.ObjectId,
            ref: "SOP",
            required: true,
            index: true,
        },
        operators: [{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }],
        files: {
            type: [audioFileSchema],
            default: [],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
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

audioSopSchema.index({ operators: 1, isDeleted: 1, isActive: 1 });

const AudioSop = mongoose.model<IAudioSop>("AudioSop", audioSopSchema);
export default AudioSop;
