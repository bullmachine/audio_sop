import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

// Interface for User document
export interface IUser extends Document {
    name: string;
    empCode: string | null;
    email: string;
    mobile: string;
    password: string;
    plant: string;
    role?: mongoose.Schema.Types.ObjectId;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;

    comparePassword(enteredPassword: string): Promise<boolean>;
}

// Schema definition
const userSchema: Schema<IUser> = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a name"],
        },
        empCode: {
            type: String,
            required: [true, "Please add an employee code"],
            unique: true,
            default: null,
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please add a valid email",
            ],
        },
        mobile: {
            type: String,
            required: [true, "Please add a mobile number"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
            minlength: 6,
            select: false,
        },
        plant: {
            type: String,
            required: false,
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Encrypt password before saving
userSchema.pre<IUser>("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

 
// Method to compare password
userSchema.methods.comparePassword = async function (
    enteredPassword: string
): Promise<boolean> {
    try {
        if (!enteredPassword) {
            throw new Error("Entered password is required");
        }
        if (!this.password) {
            throw new Error("Stored password not found");
        }
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        console.error("Password comparison error:", (error as Error).message);
        return false;
    }
};


const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
