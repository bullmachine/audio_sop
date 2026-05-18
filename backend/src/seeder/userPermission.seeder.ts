import UserPermission from "../models/UserPermission";
import Permission from "../models/Permission";
import User from "../models/User";

const UserPermissionSeeder = async () => {
    try {
        await UserPermission.deleteMany({});

        // Find Super Admin user
        const superAdminUser = await User.findOne({ email: "php@bullmachine.com" });

        if (!superAdminUser) {
            console.error('Super Admin user not found. Please run user seeder first.');
            return;
        }

        // Get all permissions
        const allPermissions = await Permission.find({ active: true });

        if (allPermissions.length === 0) {
            console.error('No permissions found. Please run permission seeder first.');
            return;
        }

        // Assign all permissions to Super Admin user
        const userPermissions = [
            {
                user: superAdminUser._id,
                permissions: allPermissions.map(permission => permission._id),
                active: true
            }
        ];

        // Insert user-permissions into the database
        await UserPermission.insertMany(userPermissions);

        console.log(`User-Permission assignments seeded successfully! Super Admin assigned ${allPermissions.length} permissions.`);
    } catch (err) {
        console.error('Error seeding user-permissions:', err);
    }
};

export default UserPermissionSeeder;
