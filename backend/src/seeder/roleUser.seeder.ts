import RoleUser from "../models/RoleUser";
import Role from "../models/Role";
import User from "../models/User";

const RoleUserSeeder = async () => {
    try {
        await RoleUser.deleteMany({});

        // Find Super Admin role and Super Admin user
        const superAdminRole = await Role.findOne({ role: "Super Admin" });
        const superAdminUser = await User.findOne({ email: "php@bullmachine.com" });
        const regularUser = await User.findOne({ email: "user@bullmachine.com" });

        if (!superAdminRole) {
            console.error('Super Admin role not found. Please run role seeder first.');
            return;
        }

        if (!superAdminUser) {
            console.error('Super Admin user not found. Please run user seeder first.');
            return;
        }

        const roleUsers = [
            {
                role: superAdminRole._id,
                users: [superAdminUser._id],
                active: true
            },
            // Assign regular user to User role
            ...(regularUser ? [{
                role: (await Role.findOne({ role: "User" }))?._id,
                users: [regularUser._id],
                active: true
            }] : [])
        ].filter(ru => ru.role && ru.users); // Filter out any entries where role or users are null

        // Insert role-user assignments into the database
        await RoleUser.insertMany(roleUsers);

        console.log('Role-User assignments seeded successfully!');
    } catch (err) {
        console.error('Error seeding role-user assignments:', err);
    }
};

export default RoleUserSeeder;
