import mongoose from 'mongoose';
import User from "../models/User";
import Role from "../models/Role";
import bcrypt from "bcryptjs";

const UserSeeder = async () => {
    try {
        await User.deleteMany({});

        const superAdminRole = await Role.findOne({ role: "Super Admin" });
        const operatorRole = await Role.findOne({ role: "Operator" });

        const users = [
            {
                name: "Super Admin",
                email: "admin@bullmachine.com",
                password: "admin@123",
                role: superAdminRole?._id ?? null,
                empCode: "123456",
                mobile: "9000000001",
                plant: "Head Office",
            },
            {
                name: "Operator One",
                email: "op001@bullmachine.com",
                password: "operator@123",
                role: operatorRole?._id ?? null,
                empCode: "OP001",
                mobile: "9000000002",
                plant: "Operator",
            },
            {
                name: "Operator Two",
                email: "op002@bullmachine.com",
                password: "operator@123",
                role: operatorRole?._id ?? null,
                empCode: "OP002",
                mobile: "9000000003",
                plant: "Operator",
            },
        ];

        const usersWithHashedPasswords = await Promise.all(
            users.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                return { ...user, password: hashedPassword };
            })
        );

        await User.insertMany(usersWithHashedPasswords);
        console.log("Users seeded successfully!");
    } catch (err) {
        console.error("Error seeding users:", err);
    }
};

export default UserSeeder;
