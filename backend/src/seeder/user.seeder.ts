import User from "../models/User";
import bcrypt from 'bcryptjs';

const UserSeeder = async () => {
    try {
        await User.deleteMany({});

        const users = [
            { name: "Super Admin Dev", email: "php@bullmachine.com", password: "admin@123", role: null, empCode: "123456", mobile: "7200102704" },
            { name: "Production & MED", email: "med@bullmachine.com", password: "med@123", role: null, empCode: "000001", mobile: "7200102705" },
            { name: "IED", email: "ied@bullmachine.com", password: "ied@123", role: null, empCode: "000002", mobile: "7200102706" },
            { name: "MED Head", email: "medhead@bullmachine.com", password: "medhead@123", role: null, empCode: "000003", mobile: "7200102707" },
            // { name: "Sourcing", email: "sourcing@bullmachine.com", password: "sourcing@123", role: null, empCode: "123461", mobile: "7200102709" },
            { name: "Operation Head", email: "operation@bullmachine.com", password: "operation@123", role: null, empCode: "000004", mobile: "7200102710" },
            { name: "Project Head", email: "project@bullmachine.com", password: "project@123", role: null, empCode: "000005", mobile: "7200102711" },
            { name: "Managing Director", email: "md@bullmachine.com", password: "md@123", role: null, empCode: "100001", mobile: "7200102712" },
            { name: "Costing", email: "costing@bullmachine.com", password: "costing@123", role: null, empCode: "000007", mobile: "7200102708" },
        ];

        const usersWithHashedPasswords = await Promise.all(users.map(async user => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            return { ...user, password: hashedPassword };
        }));

        // Insert users into the database
        await User.insertMany(usersWithHashedPasswords);

        console.log('Users seeded successfully!');
    } catch (err) {
        console.error('Error seeding users:', err);
    }
};

export default UserSeeder;